import "server-only";
import { db, newId } from "@/server/db/store";
import type { CommChannel, Communication } from "@/lib/platform/types";
import { emailProvider } from "@/integrations/email";
import { whatsappProvider } from "@/integrations/whatsapp";
import { smsProvider } from "@/integrations/sms";
import { NotConfiguredError, withRetry } from "@/integrations/core";

/**
 * CommunicationService — the only place that talks to channel providers.
 * Callers say *what* to send and to *whom*; this service picks the adapter,
 * records one Communication row for every channel, and never leaks provider details.
 */
export interface OutboundMessage {
  channel: Exclude<CommChannel, "in_app">;
  to: string;
  subject?: string | null;
  text: string;
  templateId?: string | null;
  /** Provider template name (WhatsApp) and ordered variables. */
  providerTemplate?: { name: string; variables: string[] };
  event?: string | null;
  userId?: string | null;
  studentId?: string | null;
  leadId?: string | null;
}

export async function sendMessage(msg: OutboundMessage): Promise<Communication> {
  const record: Communication = {
    id: newId("com"),
    userId: msg.userId ?? null,
    leadId: msg.leadId ?? null,
    studentId: msg.studentId ?? null,
    channel: msg.channel,
    provider: "",
    templateId: msg.templateId ?? null,
    direction: "outbound",
    status: "queued",
    providerMessageId: null,
    preview: msg.text.slice(0, 140),
    contentReference: null,
    event: msg.event ?? null,
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    readAt: null,
    failedAt: null,
    error: null,
  };
  db().communications.unshift(record);

  const run = async () => {
    if (msg.channel === "email") {
      const p = emailProvider();
      record.provider = p.key;
      return p.send({ to: msg.to, subject: msg.subject ?? "EMC", text: msg.text });
    }
    if (msg.channel === "whatsapp") {
      const p = whatsappProvider();
      record.provider = p.key;
      return p.sendTemplate({ to: msg.to, template: msg.providerTemplate?.name ?? msg.templateId ?? "generic", language: "en", variables: msg.providerTemplate?.variables ?? [], reference: record.id });
    }
    const p = smsProvider();
    record.provider = p.key;
    return p.send(msg.to, msg.text);
  };

  try {
    const res = await withRetry(run);
    if (res.ok) {
      record.status = "sent";
      record.providerMessageId = res.providerRef;
      if (record.provider === "simulated") {
        record.status = "delivered";
        record.deliveredAt = new Date().toISOString();
      }
    } else {
      record.status = "failed";
      record.failedAt = new Date().toISOString();
      record.error = res.error;
    }
  } catch (e) {
    record.status = e instanceof NotConfiguredError ? "skipped" : "failed";
    record.error = e instanceof Error ? e.message : String(e);
    if (record.status === "failed") record.failedAt = new Date().toISOString();
  }
  return record;
}
