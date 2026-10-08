import "server-only";
import { db, newId } from "@/server/db/store";
import type { CommChannel, MessageTemplate, NotificationCategory } from "@/lib/platform/types";
import type { DomainEvent, EventPayload } from "@/server/events/bus";
import { registerJob } from "@/server/jobs/queue";
import { renderTemplate } from "./templates";
import { sendMessage } from "./communication";

/**
 * NOTIFICATION ENGINE
 *   event → matching templates → recipients → channel selection → CommunicationService
 * Channel selection respects user preferences, WhatsApp opt-in and template approval.
 * Security/account notices are mandatory and ignore preferences.
 */
const MANDATORY: NotificationCategory[] = ["security"];

export function channelEnabled(userId: string, category: NotificationCategory, channel: CommChannel) {
  if (MANDATORY.includes(category)) return true;
  const pref = db().notificationPrefs.find((p) => p.userId === userId && p.category === category && p.channel === channel);
  if (pref) return pref.enabled;
  // Defaults: marketing messages are opt-in on every channel except in-app.
  return !(category === "marketing" && channel !== "in_app");
}

interface Recipient {
  userId: string | null;
  leadId: string | null;
  isStudent: boolean;
  name: string;
  email: string | null;
  phone: string | null;
  whatsappOptIn: boolean;
}

function recipientsFor(payload: EventPayload): Recipient[] {
  const out: Recipient[] = [];
  const users = db().users;
  for (const id of new Set([...(payload.studentIds ?? []), ...(payload.userIds ?? [])])) {
    const u = users.find((x) => x.id === id && x.status === "active");
    if (u) out.push({ userId: u.id, leadId: null, isStudent: u.role === "student", name: u.name, email: u.email, phone: u.phone, whatsappOptIn: true });
  }
  if (payload.leadId) {
    const l = db().leads.find((x) => x.id === payload.leadId);
    if (l) out.push({ userId: null, leadId: l.id, isStudent: false, name: l.name, email: l.email, phone: l.phone, whatsappOptIn: l.whatsappOptIn });
  }
  return out;
}

/** Staff templates go to users; lead templates go to the lead; student templates go to students. */
function audienceMatches(t: MessageTemplate, r: Recipient) {
  if (t.id === "tpl_lead_staff") return !!r.userId && !r.isStudent;
  if (t.event?.startsWith("lead.") || t.event?.startsWith("demo.")) return !!r.leadId;
  return !!r.userId;
}

export async function processEvent(event: DomainEvent, payload: EventPayload, opts: { inAppOnly?: boolean; externalOnly?: boolean } = {}) {
  const templates = db().templates.filter((t) => t.event === event && t.status === "active");
  for (const t of templates) {
    if (opts.inAppOnly && t.channel !== "in_app") continue;
    if (opts.externalOnly && t.channel === "in_app") continue;
    for (const r of recipientsFor(payload)) {
      if (!audienceMatches(t, r)) continue;
      const vars = { student_name: r.name.split(" ")[0], lead_name: r.name.split(" ")[0], ...payload.vars };
      const text = renderTemplate(t.content, vars);

      if (t.channel === "in_app") {
        if (!r.userId || !channelEnabled(r.userId, t.category, "in_app")) continue;
        db().notifications.unshift({ id: newId("ntf"), userId: r.userId, category: t.category, title: t.subject ?? t.name, body: text, href: payload.href ?? null, createdAt: new Date().toISOString(), readAt: null });
        db().communications.unshift({
          id: newId("com"), userId: r.userId, leadId: null, studentId: r.isStudent ? r.userId : null, channel: "in_app", provider: "in_app", templateId: t.id,
          direction: "outbound", status: "delivered", providerMessageId: null, preview: text.slice(0, 140), contentReference: null, event,
          createdAt: new Date().toISOString(), deliveredAt: new Date().toISOString(), readAt: null, failedAt: null, error: null,
        });
        continue;
      }

      if (r.userId && !channelEnabled(r.userId, t.category, t.channel)) continue;
      if (t.channel === "whatsapp" && (!r.whatsappOptIn || !r.phone || !["approved", "not_required"].includes(t.approval))) {
        db().communications.unshift({
          id: newId("com"), userId: r.userId, leadId: r.leadId, studentId: r.isStudent ? r.userId : null, channel: "whatsapp", provider: "—", templateId: t.id,
          direction: "outbound", status: "skipped", providerMessageId: null, preview: text.slice(0, 140), contentReference: null, event,
          createdAt: new Date().toISOString(), deliveredAt: null, readAt: null, failedAt: null,
          error: !r.whatsappOptIn ? "No WhatsApp opt-in" : t.approval !== "approved" ? `Template approval: ${t.approval}` : "No phone number",
        });
        continue;
      }
      const to = t.channel === "email" ? r.email : r.phone;
      if (!to) continue;
      await sendMessage({
        channel: t.channel, to, subject: t.subject ? renderTemplate(t.subject, vars) : null, text, templateId: t.id,
        providerTemplate: t.channel === "whatsapp" ? { name: t.id, variables: Object.values(vars) } : undefined,
        event, userId: r.userId, studentId: r.isStudent ? r.userId : null, leadId: r.leadId,
      });
    }
  }
}

registerJob<{ event: DomainEvent; payload: EventPayload }>("notifications.dispatch", (j) => processEvent(j.event, j.payload, { externalOnly: true }));
