import { NextResponse } from "next/server";
import { db, newId } from "@/server/db/store";
import { whatsappProvider } from "@/integrations/whatsapp";
import { paymentProvider } from "@/integrations/payments";

/**
 * Inbound webhooks: signature check → idempotency check → log → process.
 * Providers retry on non-2xx, so duplicates are acknowledged without reprocessing.
 */
export async function POST(req: Request, { params }: { params: Promise<{ source: string }> }) {
  const { source } = await params;
  const raw = await req.text();

  const verified =
    source === "whatsapp" ? whatsappProvider().verifyWebhook(raw, req.headers)
    : source === "payments" ? paymentProvider().verifyWebhook(raw, req.headers)
    : false;

  const log = (status: "processed" | "duplicate" | "rejected" | "failed", externalId: string, type: string, note: string | null = null) =>
    db().webhookEvents.unshift({ id: newId("whk"), source, externalId, type, receivedAt: new Date().toISOString(), status, note });

  if (!verified) {
    log("rejected", "-", "unknown", "Invalid or missing signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    log("rejected", "-", "unknown", "Malformed JSON");
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  if (source === "whatsapp") {
    const { eventId, updates } = whatsappProvider().parseStatusWebhook(payload);
    if (db().webhookEvents.some((w) => w.source === source && w.externalId === eventId && w.status === "processed")) {
      log("duplicate", eventId, "message.status");
      return NextResponse.json({ ok: true, duplicate: true });
    }
    for (const u of updates) {
      const c = db().communications.find((x) => x.providerMessageId === u.providerMessageId);
      if (!c) continue;
      c.status = u.status;
      if (u.status === "delivered") c.deliveredAt = u.at;
      if (u.status === "read") c.readAt = u.at;
      if (u.status === "failed") { c.failedAt = u.at; c.error = u.error ?? "Failed"; }
    }
    log("processed", eventId, "message.status", `${updates.length} status update(s)`);
    return NextResponse.json({ ok: true });
  }

  log("processed", "-", "unhandled");
  return NextResponse.json({ ok: true });
}
