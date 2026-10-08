import "server-only";
import { db } from "@/server/db/store";
import { permissionsFor } from "@/lib/platform/rbac";
import type * as T from "@/lib/platform/types";
import type { FunnelStageKey } from "@/components/academy/marketing/meta";
import { formatDateTime } from "@/lib/platform/format";

/**
 * Read models for the Growth area (leads, campaigns, communications, content).
 * Screens call these; they never touch the store. No writes here.
 */

const DAY = 86_400_000;
const IST = 330 * 60_000;

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export const userName = (id: string | null | undefined) => (id ? db().users.find((u) => u.id === id)?.name ?? "—" : "Unassigned");

function usersWith(permission: T.Permission) {
  return db().users.filter((u) => u.status === "active" && permissionsFor(u.role, u.extraPermissions).includes(permission));
}
/** Everyone who should hear about new leads. */
export const leadWatcherIds = () => usersWith("leads.view").map((u) => u.id);
/** People a lead can be assigned to. */
export const assignableUsers = () => usersWith("leads.edit").map((u) => ({ id: u.id, name: u.name, title: u.title }));

/* ------------------------------------------------------------------ */
/* Funnel                                                              */
/* ------------------------------------------------------------------ */

const RANK: Record<T.LeadStatus, number> = { new: 0, contacted: 1, counselling: 2, demo_booked: 3, demo_completed: 4, application: 5, converted: 6, lost: -1 };
const STAGE_MIN: Record<FunnelStageKey, number> = { leads: 0, counselling: 2, demo: 3, application: 5, admission: 6 };

/** Cumulative: a converted lead also passed counselling, demo and application. Lost leads only count as leads. */
export function inStage(l: T.Lead, stage: FunnelStageKey) {
  if (stage === "leads") return true;
  return RANK[l.status] >= STAGE_MIN[stage];
}

export function isStage(v: string | undefined): v is FunnelStageKey {
  return !!v && v in STAGE_MIN;
}

export function funnelCounts(leads: T.Lead[] = db().leads) {
  return (Object.keys(STAGE_MIN) as FunnelStageKey[]).map((k) => ({ key: k, value: leads.filter((l) => inStage(l, k)).length }));
}

export function growthSummary() {
  const leads = db().leads;
  const count = (k: FunnelStageKey) => leads.filter((l) => inStage(l, k)).length;
  const converted = count("admission");
  const openAdmissions = db().admissions.filter((a) => !["enrolled"].includes(a.stage)).length;
  const weekAgo = Date.now() - 7 * DAY;
  return {
    leads: leads.length,
    newThisWeek: leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length,
    counselling: count("counselling"),
    demos: count("demo"),
    demosBooked: leads.filter((l) => l.status === "demo_booked").length,
    applications: count("application"),
    admissions: converted,
    openAdmissions,
    lost: leads.filter((l) => l.status === "lost").length,
    conversionRate: leads.length ? Math.round((converted / leads.length) * 1000) / 10 : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

export interface LeadFilters {
  stage?: string;
  status?: string;
  source?: string;
  assigned?: string;
  q?: string;
  followup?: string;
  campaign?: string;
}

/** End of today in India time. */
export function endOfTodayIST() {
  const ist = new Date(Date.now() + IST);
  ist.setUTCHours(23, 59, 59, 999);
  return ist.getTime() - IST;
}
export function startOfTodayIST() {
  const ist = new Date(Date.now() + IST);
  ist.setUTCHours(0, 0, 0, 0);
  return ist.getTime() - IST;
}

const open = (l: T.Lead) => l.status !== "converted" && l.status !== "lost";
export const followUpDue = (l: T.Lead) => open(l) && !!l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() <= endOfTodayIST();

export function filterLeads(f: LeadFilters, userId: string) {
  const q = f.q?.trim().toLowerCase().slice(0, 80);
  const qDigits = q?.replace(/\D/g, "");
  return db()
    .leads.filter((l) => {
      if (isStage(f.stage) && !inStage(l, f.stage)) return false;
      if (f.status && l.status !== f.status) return false;
      if (f.source && l.source !== f.source) return false;
      if (f.campaign && l.campaignId !== f.campaign) return false;
      if (f.assigned === "me" && l.assignedTo !== userId) return false;
      if (f.assigned === "none" && l.assignedTo) return false;
      if (f.followup === "due" && !followUpDue(l)) return false;
      if (q) {
        const hay = `${l.name} ${l.email ?? ""} ${l.programInterest ?? ""}`.toLowerCase();
        const phoneHit = !!qDigits && qDigits.length >= 3 && l.phone.replace(/\D/g, "").includes(qDigits);
        if (!hay.includes(q) && !phoneHit) return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const leadById = (id: string) => db().leads.find((l) => l.id === id) ?? null;
export const campaignById = (id: string | null) => (id ? db().campaigns.find((c) => c.id === id) ?? null : null);
export const campaignName = (id: string | null) => campaignById(id)?.name ?? "—";

/** Follow-ups due today or overdue. The signed-in user's leads first, then by due time. */
export function followUps(userId: string) {
  return db()
    .leads.filter(followUpDue)
    .sort((a, b) => {
      const mine = Number(b.assignedTo === userId) - Number(a.assignedTo === userId);
      return mine || a.nextFollowUpAt!.localeCompare(b.nextFollowUpAt!);
    })
    .map((l) => ({ lead: l, overdue: new Date(l.nextFollowUpAt!).getTime() < startOfTodayIST(), mine: l.assignedTo === userId }));
}

/** Newest enquiries, fresh website enquiries pinned to the top. */
export function recentEnquiries(limit = 6) {
  const leads = [...db().leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const dayAgo = Date.now() - 2 * DAY;
  const web = leads.filter((l) => l.source === "website" && l.status === "new" && new Date(l.createdAt).getTime() >= dayAgo);
  return [...web, ...leads.filter((l) => !web.includes(l))].slice(0, limit);
}

export function leadsBySource() {
  const map = new Map<T.LeadSource, { total: number; converted: number }>();
  for (const l of db().leads) {
    const m = map.get(l.source) ?? { total: 0, converted: 0 };
    m.total++;
    if (l.status === "converted") m.converted++;
    map.set(l.source, m);
  }
  return [...map.entries()].map(([source, v]) => ({ source, ...v, rate: v.total ? Math.round((v.converted / v.total) * 100) : 0 })).sort((a, b) => b.total - a.total);
}

/** Leads created per week (Monday-start, India time), oldest first. */
export function weeklyLeads(weeks = 8) {
  const startToday = startOfTodayIST();
  const dow = (new Date(startToday + IST).getUTCDay() + 6) % 7; // 0 = Monday
  const thisWeek = startToday - dow * DAY;
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = thisWeek - (weeks - 1 - i) * 7 * DAY;
    return { start, end: start + 7 * DAY, value: 0 };
  });
  for (const l of db().leads) {
    const t = new Date(l.createdAt).getTime();
    const b = buckets.find((x) => t >= x.start && t < x.end);
    if (b) b.value++;
  }
  return buckets.map((b, i) => ({
    label: i === weeks - 1 ? "Now" : (() => { const d = new Date(b.start + IST); return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`; })(),
    value: b.value,
  }));
}

/* ------------------------------------------------------------------ */
/* Lead detail                                                         */
/* ------------------------------------------------------------------ */

export type TimelineItem =
  | { kind: "activity"; id: string; at: string; type: T.ActivityType; summary: string; by: string | null }
  | { kind: "message"; id: string; at: string; channel: T.CommChannel; status: T.CommStatus; preview: string; template: string | null; event: string | null; error: string | null; provider: string };

export function leadTimeline(leadId: string): TimelineItem[] {
  const d = db();
  const acts: TimelineItem[] = d.leadActivities
    .filter((a) => a.leadId === leadId)
    .map((a) => ({ kind: "activity", id: a.id, at: a.at, type: a.type, summary: a.summary, by: a.by ? userName(a.by) : null }));
  const msgs: TimelineItem[] = d.communications
    .filter((c) => c.leadId === leadId)
    .map((c) => ({
      kind: "message", id: c.id, at: c.createdAt, channel: c.channel, status: c.status, preview: c.preview,
      template: c.templateId ? d.templates.find((t) => t.id === c.templateId)?.name ?? null : null, event: c.event, error: c.error, provider: c.provider,
    }));
  return [...acts, ...msgs].sort((a, b) => b.at.localeCompare(a.at));
}

/** Variables available when messaging a lead. */
export function leadVars(lead: T.Lead): Record<string, string> {
  const v: Record<string, string> = {
    lead_name: lead.name.split(" ")[0],
    lead_source: lead.source.replace("_", " "),
    course_name: lead.programInterest ?? "the EMC Career Program",
  };
  if (lead.status === "demo_booked" && lead.nextFollowUpAt) v.class_date = formatDateTime(lead.nextFollowUpAt);
  return v;
}

/**
 * Marketing templates (email / WhatsApp) for a lead, each with the reason it can't be sent right now, if any.
 * Student and staff templates are never offered to a lead.
 */
export function sendableTemplates(lead: T.Lead) {
  const vars = leadVars(lead);
  return db()
    .templates.filter((t) => t.status === "active" && t.category === "marketing" && (t.channel === "email" || t.channel === "whatsapp"))
    .map((t) => {
      let blocked: string | null = null;
      const missing = [...t.variables, ...(t.subject?.match(/{{\s*(\w+)\s*}}/g)?.map((x) => x.replace(/[{}\s]/g, "")) ?? [])].filter((k) => !vars[k]);
      if (t.channel === "email" && !lead.email) blocked = "No email address";
      if (t.channel === "whatsapp") {
        if (!lead.whatsappOptIn) blocked = "No WhatsApp opt-in";
        else if (t.approval !== "approved") blocked = `Approval ${t.approval.replace("_", " ")}`;
      }
      if (!blocked && missing.length) blocked = missing.includes("class_date") ? "Book a demo first" : `Needs ${missing.join(", ")}`;
      return { id: t.id, name: t.name, channel: t.channel, subject: t.subject, content: t.content, category: t.category, blocked };
    });
}

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export function campaignStats() {
  const leads = db().leads;
  return db().campaigns.map((c) => {
    const mine = leads.filter((l) => l.campaignId === c.id);
    const conversions = mine.filter((l) => l.status === "converted").length;
    const cpl = mine.length ? Math.round(c.spend / mine.length) : null;
    const roi = c.spend > 0 ? Math.round(((c.revenue - c.spend) / c.spend) * 100) : null;
    return { campaign: c, leads: mine.length, conversions, cpl, roi, conversionRate: mine.length ? Math.round((conversions / mine.length) * 100) : 0 };
  });
}

/* ------------------------------------------------------------------ */
/* Communications                                                      */
/* ------------------------------------------------------------------ */

export interface CommFilters {
  channel?: string;
  status?: string;
  page?: number;
}

export function communications(f: CommFilters) {
  const d = db();
  return d.communications
    .filter((c) => (!f.channel || c.channel === f.channel) && (!f.status || c.status === f.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => {
      const lead = c.leadId ? d.leads.find((l) => l.id === c.leadId) : null;
      const recipientId = c.studentId ?? c.userId;
      const user = recipientId ? d.users.find((u) => u.id === recipientId) : null;
      return {
        comm: c,
        recipient: lead ? { type: "Lead" as const, name: lead.name, href: `/academy/marketing/leads/${lead.id}` } : user ? { type: user.role === "student" ? ("Student" as const) : ("Staff" as const), name: user.name, href: null } : { type: "—" as const, name: "Unknown", href: null },
        template: c.templateId ? d.templates.find((t) => t.id === c.templateId)?.name ?? null : null,
      };
    });
}

export function deliveryStats() {
  const all = db().communications;
  const by = (s: T.CommStatus) => all.filter((c) => c.status === s).length;
  return { total: all.length, sent: by("sent") + by("queued"), delivered: by("delivered"), read: by("read"), failed: by("failed"), skipped: by("skipped") };
}

/* ------------------------------------------------------------------ */
/* Templates & content                                                 */
/* ------------------------------------------------------------------ */

export const templates = () => [...db().templates].sort((a, b) => a.name.localeCompare(b.name));
export const templateById = (id: string) => db().templates.find((t) => t.id === id) ?? null;

export function marketingContent(f: { kind?: string; state?: string }) {
  return db()
    .content.filter((c) => c.area === "marketing" && (!f.kind || c.kind === f.kind) && (!f.state || c.status === f.state))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export const contentCountsByState = () => {
  const items = db().content.filter((c) => c.area === "marketing");
  const states: T.PublishState[] = ["draft", "review", "approved", "published", "archived"];
  return { all: items.length, ...Object.fromEntries(states.map((s) => [s, items.filter((c) => c.status === s).length])) } as Record<"all" | T.PublishState, number>;
};

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

/** Share of leads (older than 24 h, or already contacted) whose first human contact came within 24 h. */
export function followUpSla() {
  const d = db();
  const now = Date.now();
  let eligible = 0;
  let within = 0;
  let never = 0;
  for (const l of d.leads) {
    const created = new Date(l.createdAt).getTime();
    const first = d.leadActivities
      .filter((a) => a.leadId === l.id && a.type !== "form" && a.type !== "status" && a.by)
      .map((a) => new Date(a.at).getTime())
      .sort((a, b) => a - b)[0];
    if (first === undefined && now - created < DAY) continue;
    eligible++;
    if (first === undefined) never++;
    else if (first - created <= DAY) within++;
  }
  return { eligible, within, never, rate: eligible ? Math.round((within / eligible) * 100) : null };
}

/** Leads created per week across a longer window for the analytics line. */
export function leadsOverTime(weeks = 12) {
  return weeklyLeads(weeks);
}
