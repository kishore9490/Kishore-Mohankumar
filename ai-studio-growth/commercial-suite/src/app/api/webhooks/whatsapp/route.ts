import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { extractStatusUpdates, verifyWebhookSignature } from "@/lib/integrations/whatsapp";
import { mapWhatsAppStatus, STATUS_RANK } from "@/lib/integrations/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Webhook verification handshake (Meta sends hub.mode, hub.verify_token, hub.challenge). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (expected && url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === expected) {
    return new NextResponse(url.searchParams.get("hub.challenge") ?? "", { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Delivery status updates. Signature-verified; duplicate events are ignored; statuses never regress. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 1_000_000) return new NextResponse("Payload too large", { status: 413 });
  if (!verifyWebhookSignature(raw, req.headers.get("x-hub-signature-256"))) return new NextResponse("Invalid signature", { status: 401 });
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
  let processed = 0;
  for (const u of extractStatusUpdates(payload)) {
    const mapped = mapWhatsAppStatus(u.status);
    if (!mapped) continue;
    try {
      await prisma.webhookEvent.create({ data: { provider: "whatsapp", eventKey: `wa:${u.messageId}:${u.status}` } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue; // duplicate delivery
      throw e;
    }
    const log = await prisma.communicationLog.findUnique({ where: { providerMessageId: u.messageId } });
    if (!log) continue;
    if (mapped !== "FAILED" && STATUS_RANK[mapped] <= STATUS_RANK[log.status]) continue;
    await prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: mapped,
        statusUpdatedAt: u.timestamp ? new Date(Number(u.timestamp) * 1000) : new Date(),
        ...(mapped === "FAILED" ? { errorMessage: (u.errorTitle ?? "Delivery failed (reported by WhatsApp)").slice(0, 500) } : {}),
      },
    });
    processed++;
  }
  return NextResponse.json({ received: true, processed });
}
