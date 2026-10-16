import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { extractInboundMessages, extractStatusUpdates, normalizeWhatsAppNumber, verifyWebhookSignature } from "@/lib/integrations/whatsapp";
import { loadWhatsApp } from "@/lib/integrations/config";
import { mapWhatsAppStatus, STATUS_RANK } from "@/lib/integrations/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Webhook verification handshake (Meta sends hub.mode, hub.verify_token, hub.challenge). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const { secrets } = await loadWhatsApp();
  const given = url.searchParams.get("hub.verify_token") ?? "";
  if (secrets.verifyToken && url.searchParams.get("hub.mode") === "subscribe" && safeEqual(given, secrets.verifyToken)) {
    return new NextResponse(url.searchParams.get("hub.challenge") ?? "", { status: 200, headers: { "content-type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Delivery status updates and inbound-message notifications. Signature-verified; duplicate events
 * are ignored; statuses never regress. Inbound message content is not stored — only the time, to
 * track the 24-hour customer-service window.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 1_000_000) return new NextResponse("Payload too large", { status: 413 });
  const { secrets } = await loadWhatsApp();
  if (!verifyWebhookSignature(raw, req.headers.get("x-hub-signature-256"), secrets.appSecret)) return new NextResponse("Invalid signature", { status: 401 });
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

  const inbound = extractInboundMessages(payload);
  if (inbound.length) {
    const customers = await prisma.customer.findMany({ where: { phone: { not: null } }, select: { id: true, phone: true } });
    for (const m of inbound) {
      const from = normalizeWhatsAppNumber(m.from);
      const at = m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date();
      const ids = customers.filter((c) => c.phone && normalizeWhatsAppNumber(c.phone) === from).map((c) => c.id);
      if (ids.length) {
        await prisma.customer.updateMany({ where: { id: { in: ids }, OR: [{ whatsappLastInboundAt: null }, { whatsappLastInboundAt: { lt: at } }] }, data: { whatsappLastInboundAt: at } });
        processed++;
      }
    }
  }
  return NextResponse.json({ received: true, processed });
}
