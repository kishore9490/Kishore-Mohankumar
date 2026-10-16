import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loadBrevo } from "@/lib/integrations/config";
import { mapBrevoEvent } from "@/lib/integrations/brevo";
import { STATUS_RANK } from "@/lib/integrations/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BrevoEvent = { event?: string; "message-id"?: string; message_id?: string; reason?: string; ts_event?: number; ts?: number };

/**
 * Brevo transactional webhook (delivered / opened / click / bounces / blocked …).
 * Brevo does not sign webhooks, so the URL carries a long random token generated in Settings,
 * compared in constant time. Events are de-duplicated and statuses never regress (except to Failed).
 */
export async function POST(req: Request) {
  const { secrets } = await loadBrevo();
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const expected = secrets.webhookToken ?? "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) return new NextResponse("Forbidden", { status: 403 });

  const raw = await req.text();
  if (raw.length > 1_000_000) return new NextResponse("Payload too large", { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
  const events = (Array.isArray(body) ? body : [body]) as BrevoEvent[];
  let processed = 0;
  for (const ev of events) {
    const messageId = ev["message-id"] ?? ev.message_id;
    const event = ev.event;
    if (!messageId || !event) continue;
    const mapped = mapBrevoEvent(event);
    if (!mapped) continue;
    try {
      await prisma.webhookEvent.create({ data: { provider: "brevo", eventKey: `brevo:${messageId}:${event}` } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
    const log = await prisma.communicationLog.findUnique({ where: { providerMessageId: messageId } });
    if (!log) continue;
    if (mapped !== "FAILED" && STATUS_RANK[mapped] <= STATUS_RANK[log.status]) continue;
    const ts = ev.ts_event ?? ev.ts;
    await prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: mapped,
        statusUpdatedAt: ts ? new Date(ts * 1000) : new Date(),
        ...(mapped === "FAILED" ? { errorMessage: `Brevo reported ${event.replace("_", " ")}${ev.reason ? `: ${String(ev.reason).slice(0, 200)}` : ""}` } : {}),
      },
    });
    processed++;
  }
  return NextResponse.json({ received: true, processed });
}
