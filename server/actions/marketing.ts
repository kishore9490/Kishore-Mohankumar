"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, newId } from "@/server/db/store";
import { assertPermission, AuthError } from "@/server/auth/session";
import type * as T from "@/lib/platform/types";
import { audit } from "@/server/services/audit";
import { emit } from "@/server/events/bus";
import { sendMessage } from "@/server/services/communication";
import { renderTemplate, TEMPLATE_VARIABLES } from "@/server/services/templates";
import { askAI } from "@/server/services/ai";
import { integrationStatuses } from "@/integrations/registry";
import { assignableUsers, leadVars, leadWatcherIds, sendableTemplates } from "@/server/repositories/growth";
import { formatDateTime } from "@/lib/platform/format";

/**
 * Growth actions. Each one: assertPermission → validate & clip → mutate → audit → emit → revalidate.
 * Form actions return a FormState so the UI can show inline errors.
 */
export interface FormState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  /** Existing record the user should open instead (duplicate lead). */
  existingId?: string;
  draft?: string;
  draftLabel?: string;
  /** Changes on every submit so client effects can react to it. */
  at?: number;
  /** Submitted values echoed back so a failed form keeps what was typed. */
  values?: Record<string, string>;
}

const LEAD_STATUSES: T.LeadStatus[] = ["new", "contacted", "counselling", "demo_booked", "demo_completed", "application", "converted", "lost"];
const SOURCES: T.LeadSource[] = ["website", "google", "meta", "instagram", "whatsapp", "email", "organic", "referral", "walk_in", "other"];
const CHANNELS: T.Channel[] = ["google", "meta", "instagram", "whatsapp", "email", "organic", "referral", "other"];
const LOGGABLE: T.ActivityType[] = ["call", "email", "whatsapp", "note", "counselling", "demo", "task"];
const CONTACT_TYPES: T.ActivityType[] = ["call", "email", "whatsapp", "counselling", "demo"];
const KINDS: T.ContentKind[] = ["blog", "landing_page", "social_post", "email_campaign", "whatsapp_campaign", "announcement", "seo", "promo"];
const STATUS_LABEL: Record<T.LeadStatus, string> = {
  new: "New", contacted: "Contacted", counselling: "Counselling", demo_booked: "Demo booked", demo_completed: "Demo completed",
  application: "Application", converted: "Converted", lost: "Lost",
};

const str = (f: FormData, k: string, max = 500) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};
const vals = (f: FormData): Record<string, string> =>
  Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")).map(([k, v]) => [k, String(v).slice(0, 2000)]));
const digits = (s: string) => s.replace(/\D/g, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const now = () => new Date().toISOString();
/** <input type="datetime-local"> values are entered in India time. */
const fromLocalIST = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

async function guard(permission: T.Permission) {
  try {
    return { user: await assertPermission(permission) };
  } catch (e) {
    if (e instanceof AuthError) return { error: e.reason === "unauthenticated" ? "Your session ended. Please sign in again." : "You don’t have permission to do that." };
    throw e;
  }
}

function revalidateGrowth(leadId?: string) {
  revalidatePath("/academy/marketing", "layout");
  if (leadId) revalidatePath(`/academy/marketing/leads/${leadId}`);
}

function addActivity(leadId: string, type: T.ActivityType, summary: string, by: string | null) {
  db().leadActivities.push({ id: newId("act"), leadId, type, summary: summary.slice(0, 500), at: now(), by });
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

export async function createLead(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.edit");
  if (!g.user) return { ok: false, error: g.error };
  const user = g.user;

  const name = str(form, "name", 120);
  const phone = str(form, "phone", 20);
  const email = str(form, "email", 160).toLowerCase();
  const programInterest = str(form, "programInterest", 120) || null;
  const source = str(form, "source") as T.LeadSource;
  const campaignId = str(form, "campaignId", 40) || null;
  const assignedTo = str(form, "assignedTo", 40) || null;
  const note = str(form, "note", 500);
  const whatsappOptIn = form.get("whatsappOptIn") === "on";

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter the lead’s full name.";
  const pd = digits(phone);
  if (pd.length < 10 || pd.length > 13) fieldErrors.phone = "Enter a phone number with at least 10 digits.";
  if (email && !EMAIL.test(email)) fieldErrors.email = "That email address doesn’t look right.";
  if (!SOURCES.includes(source)) fieldErrors.source = "Choose where this lead came from.";
  if (campaignId && !db().campaigns.some((c) => c.id === campaignId)) fieldErrors.campaignId = "Choose a campaign from the list.";
  if (assignedTo && !assignableUsers().some((u) => u.id === assignedTo)) fieldErrors.assignedTo = "Choose a team member from the list.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors, at: Date.now(), values: vals(form) };

  const existing = db().leads.find((l) => digits(l.phone).slice(-10) === pd.slice(-10));
  if (existing) {
    return { ok: false, error: `A lead with this phone number already exists: ${existing.name}.`, existingId: existing.id, fieldErrors: { phone: "Duplicate phone number." }, at: Date.now(), values: vals(form) };
  }

  const lead: T.Lead = {
    id: newId("lead"),
    name,
    phone: pd.length === 10 ? `+91 ${pd}` : `+${pd}`,
    email: email || null,
    programInterest,
    education: null,
    source,
    campaignId,
    status: "new",
    assignedTo,
    lastContactAt: null,
    nextFollowUpAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
    createdAt: now(),
    whatsappOptIn,
    lostReason: null,
  };
  db().leads.push(lead);
  addActivity(lead.id, "form", `Lead added by ${user.name}${note ? ` — ${note}` : ""}`, user.id);
  await audit({ user, action: "lead.created", objectType: "Lead", objectId: lead.id, meta: { source } });
  await emit("lead.created", {
    leadId: lead.id,
    userIds: leadWatcherIds(),
    vars: { lead_name: name.split(" ")[0], lead_source: source.replace("_", " "), course_name: programInterest ?? "a program" },
    href: `/academy/marketing/leads/${lead.id}`,
  });
  revalidateGrowth();
  redirect(`/academy/marketing/leads/${lead.id}?created=1`);
}

export async function updateLeadStatus(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.edit");
  if (!g.user) return { ok: false, error: g.error };
  const user = g.user;
  const lead = db().leads.find((l) => l.id === str(form, "leadId", 60));
  if (!lead) return { ok: false, error: "This lead no longer exists." };
  const status = str(form, "status") as T.LeadStatus;
  const reason = str(form, "reason", 200);
  const fieldErrors: Record<string, string> = {};
  if (!LEAD_STATUSES.includes(status)) fieldErrors.status = "Choose a status.";
  if (status === lead.status) fieldErrors.status = "The lead is already at this stage.";
  if (status === "lost" && reason.length < 3) fieldErrors.reason = "Say why the lead was lost — it helps improve campaigns.";
  let classDate: string | null = null;
  if (status === "demo_booked") {
    classDate = fromLocalIST(str(form, "classDate", 20));
    if (!classDate) fieldErrors.classDate = "Pick the demo class date and time.";
    else if (new Date(classDate).getTime() < Date.now() - 3600_000) fieldErrors.classDate = "The demo must be in the future.";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors, at: Date.now(), values: vals(form) };

  const from = lead.status;
  lead.status = status;
  lead.lostReason = status === "lost" ? reason : null;
  if (status === "converted" || status === "lost") lead.nextFollowUpAt = null;
  if (status === "demo_booked" && classDate) lead.nextFollowUpAt = classDate;
  if (!lead.assignedTo) lead.assignedTo = user.id;
  addActivity(lead.id, "status", `${STATUS_LABEL[from]} → ${STATUS_LABEL[status]}${status === "lost" ? ` — ${reason}` : ""}${classDate ? ` — demo on ${formatDateTime(classDate)}` : ""}`, user.id);

  let createdAdmission = false;
  if (status === "converted" && !db().admissions.some((a) => a.leadId === lead.id)) {
    const program = db().programs.find((p) => p.name === lead.programInterest) ?? db().programs[0];
    db().admissions.push({ id: newId("adm"), leadId: lead.id, name: lead.name, phone: lead.phone, programId: program.id, stage: "admitted", documentsComplete: false, batchId: null, updatedAt: now() });
    createdAdmission = true;
  }

  await audit({ user, action: "lead.status_changed", objectType: "Lead", objectId: lead.id, meta: { from, to: status, admissionCreated: createdAdmission } });
  const vars = leadVars(lead);
  const href = `/academy/marketing/leads/${lead.id}`;
  await emit("lead.status_changed", { leadId: lead.id, vars: { ...vars, lead_status: STATUS_LABEL[status] }, href });
  if (status === "demo_booked" && classDate) await emit("demo.booked", { leadId: lead.id, vars: { ...vars, class_date: formatDateTime(classDate) }, href });
  if (status === "demo_completed") await emit("demo.completed", { leadId: lead.id, vars, href });
  revalidateGrowth(lead.id);
  return { ok: true, message: `Status updated to ${STATUS_LABEL[status]}.${createdAdmission ? " An admission record was created." : ""}`, at: Date.now() };
}

export async function assignLead(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.edit");
  if (!g.user) return { ok: false, error: g.error };
  const lead = db().leads.find((l) => l.id === str(form, "leadId", 60));
  if (!lead) return { ok: false, error: "This lead no longer exists." };
  const to = str(form, "assignedTo", 40) || null;
  const person = to ? assignableUsers().find((u) => u.id === to) : null;
  if (to && !person) return { ok: false, fieldErrors: { assignedTo: "Choose a team member from the list." }, at: Date.now() };
  if (lead.assignedTo === to) return { ok: true, message: "No change.", at: Date.now() };
  lead.assignedTo = to;
  addActivity(lead.id, "note", person ? `Assigned to ${person.name}` : "Unassigned", g.user.id);
  await audit({ user: g.user, action: "lead.assigned", objectType: "Lead", objectId: lead.id, meta: { assignedTo: to } });
  revalidateGrowth(lead.id);
  return { ok: true, message: person ? `Assigned to ${person.name}.` : "Lead unassigned.", at: Date.now() };
}

export async function setFollowUp(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.edit");
  if (!g.user) return { ok: false, error: g.error };
  const lead = db().leads.find((l) => l.id === str(form, "leadId", 60));
  if (!lead) return { ok: false, error: "This lead no longer exists." };
  const raw = str(form, "nextFollowUpAt", 20);
  let next: string | null = null;
  if (raw) {
    next = fromLocalIST(raw);
    if (!next) return { ok: false, fieldErrors: { nextFollowUpAt: "Pick a valid date and time." }, at: Date.now() };
    if (new Date(next).getTime() > Date.now() + 365 * 86_400_000) return { ok: false, fieldErrors: { nextFollowUpAt: "Choose a date within the next year." }, at: Date.now() };
  }
  lead.nextFollowUpAt = next;
  addActivity(lead.id, "task", next ? `Follow-up set for ${formatDateTime(next)}` : "Follow-up cleared", g.user.id);
  await audit({ user: g.user, action: "lead.followup_set", objectType: "Lead", objectId: lead.id, meta: { at: next } });
  revalidateGrowth(lead.id);
  return { ok: true, message: next ? `Follow-up set for ${formatDateTime(next)}.` : "Follow-up cleared.", at: Date.now() };
}

export async function logActivity(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.edit");
  if (!g.user) return { ok: false, error: g.error };
  const lead = db().leads.find((l) => l.id === str(form, "leadId", 60));
  if (!lead) return { ok: false, error: "This lead no longer exists." };
  const type = str(form, "type") as T.ActivityType;
  const summary = str(form, "summary", 500);
  const fieldErrors: Record<string, string> = {};
  if (!LOGGABLE.includes(type)) fieldErrors.type = "Choose an activity type.";
  if (summary.length < 3) fieldErrors.summary = "Add a short summary of what happened.";
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors, at: Date.now(), values: vals(form) };

  addActivity(lead.id, type, summary, g.user.id);
  let advanced = false;
  if (CONTACT_TYPES.includes(type)) {
    lead.lastContactAt = now();
    if (lead.status === "new") {
      lead.status = "contacted";
      addActivity(lead.id, "status", "New → Contacted", g.user.id);
      advanced = true;
    }
    if (!lead.assignedTo) lead.assignedTo = g.user.id;
  }
  await audit({ user: g.user, action: "lead.activity_logged", objectType: "Lead", objectId: lead.id, meta: { type } });
  revalidateGrowth(lead.id);
  return { ok: true, message: advanced ? "Activity logged. Lead moved to Contacted." : "Activity logged.", at: Date.now() };
}

export async function sendLeadMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("communications.send");
  if (!g.user) return { ok: false, error: g.error };
  if (!g.user.permissions.includes("leads.view")) return { ok: false, error: "You don’t have permission to do that." };
  const lead = db().leads.find((l) => l.id === str(form, "leadId", 60));
  if (!lead) return { ok: false, error: "This lead no longer exists." };
  const option = sendableTemplates(lead).find((t) => t.id === str(form, "templateId", 60));
  if (!option) return { ok: false, fieldErrors: { templateId: "Choose a template." }, at: Date.now() };
  if (option.blocked) return { ok: false, fieldErrors: { templateId: `This template can’t be sent: ${option.blocked}.` }, at: Date.now() };

  const vars = leadVars(lead);
  const text = renderTemplate(option.content, vars);
  const channel = option.channel as "email" | "whatsapp";
  const to = channel === "email" ? lead.email! : lead.phone;
  const rec = await sendMessage({
    channel, to, subject: option.subject ? renderTemplate(option.subject, vars) : null, text, templateId: option.id,
    providerTemplate: channel === "whatsapp" ? { name: option.id, variables: Object.values(vars) } : undefined,
    event: "manual", leadId: lead.id,
  });
  addActivity(lead.id, channel, `Sent “${option.name}” by ${channel === "email" ? "email" : "WhatsApp"} — ${rec.status}${rec.error ? ` (${rec.error})` : ""}`, g.user.id);
  if (rec.status !== "failed" && rec.status !== "skipped") lead.lastContactAt = now();
  await audit({ user: g.user, action: "message.sent", objectType: "Communication", objectId: rec.id, result: rec.status === "failed" ? "failed" : "success", meta: { channel, template: option.id, leadId: lead.id, status: rec.status } });
  revalidateGrowth(lead.id);
  if (rec.status === "failed" || rec.status === "skipped") return { ok: false, error: `Message ${rec.status}: ${rec.error ?? "unknown error"}`, at: Date.now() };
  return { ok: true, message: `Message ${rec.status} via simulated provider.`, at: Date.now() };
}

export async function leadAISummary(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("leads.view");
  if (!g.user) return { ok: false, error: g.error };
  const id = str(form, "leadId", 60);
  const res = await askAI(g.user, {
    purpose: "marketing.lead_summary",
    contextId: id,
    prompt: "Summarise this enquiry in 3 short bullet points for an admissions counsellor, then suggest one next best action. Do not invent facts.",
  });
  if (!res.ok) return { ok: false, error: res.reason, at: Date.now() };
  return { ok: true, draft: res.draft, draftLabel: res.label, at: Date.now() };
}

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export async function saveCampaign(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("campaigns.manage");
  if (!g.user) return { ok: false, error: g.error };
  const id = str(form, "id", 40);
  const name = str(form, "name", 120);
  const channel = str(form, "channel") as T.Channel;
  const status = str(form, "status") as T.Campaign["status"];
  const num = (k: string) => {
    const v = str(form, k, 15);
    if (!v) return 0;
    const n = Number(v.replace(/,/g, ""));
    return Number.isFinite(n) ? Math.round(n) : NaN;
  };
  const budget = num("budget");
  const spend = num("spend");
  const revenue = num("revenue");
  const startDate = str(form, "startDate", 10);
  const endDate = str(form, "endDate", 10);
  const fe: Record<string, string> = {};
  if (name.length < 3) fe.name = "Give the campaign a name (3+ characters).";
  if (!CHANNELS.includes(channel)) fe.channel = "Choose a channel.";
  if (!["draft", "active", "paused", "ended"].includes(status)) fe.status = "Choose a status.";
  for (const [k, v] of [["budget", budget], ["spend", spend], ["revenue", revenue]] as const) if (Number.isNaN(v) || v < 0 || v > 100_000_000) fe[k] = "Enter an amount between 0 and 10,00,00,000.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) fe.startDate = "Pick a start date.";
  if (endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate)) fe.endDate = "End date must be on or after the start date.";
  if (Object.keys(fe).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fe, at: Date.now(), values: vals(form) };

  const toIso = (d: string) => new Date(`${d}T00:00:00+05:30`).toISOString();
  let c = id ? db().campaigns.find((x) => x.id === id) : undefined;
  if (id && !c) return { ok: false, error: "This campaign no longer exists." };
  const created = !c;
  if (!c) {
    c = { id: newId("cmp"), name, channel, status, budget, spend, conversions: 0, revenue, startDate: toIso(startDate), endDate: endDate ? toIso(endDate) : null };
    db().campaigns.push(c);
  } else Object.assign(c, { name, channel, status, budget, spend, revenue, startDate: toIso(startDate), endDate: endDate ? toIso(endDate) : null });
  await audit({ user: g.user, action: "campaign.updated", objectType: "Campaign", objectId: c.id, meta: { created, status } });
  revalidateGrowth();
  redirect(`/academy/marketing/campaigns?saved=${c.id}`);
}

export async function toggleCampaign(form: FormData): Promise<void> {
  const g = await guard("campaigns.manage");
  if (!g.user) return;
  const c = db().campaigns.find((x) => x.id === str(form, "id", 40));
  if (!c || (c.status !== "active" && c.status !== "paused")) return;
  c.status = c.status === "active" ? "paused" : "active";
  await audit({ user: g.user, action: "campaign.updated", objectType: "Campaign", objectId: c.id, meta: { status: c.status } });
  revalidateGrowth();
}

/* ------------------------------------------------------------------ */
/* Communications                                                      */
/* ------------------------------------------------------------------ */

export async function retryCommunication(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("communications.view");
  if (!g.user) return { ok: false, error: g.error };
  const d = db();
  const orig = d.communications.find((c) => c.id === str(form, "id", 60));
  if (!orig || orig.status !== "failed") return { ok: false, error: "Only failed messages can be retried.", at: Date.now() };
  if (orig.channel === "in_app") return { ok: false, error: "In-app notices can’t be retried.", at: Date.now() };
  const lead = orig.leadId ? d.leads.find((l) => l.id === orig.leadId) : null;
  const person = !lead && (orig.studentId ?? orig.userId) ? d.users.find((u) => u.id === (orig.studentId ?? orig.userId)) : null;
  const to = orig.channel === "email" ? lead?.email ?? person?.email : lead?.phone ?? person?.phone;
  if (!to) return { ok: false, error: "The recipient has no address for this channel.", at: Date.now() };
  const tpl = orig.templateId ? d.templates.find((t) => t.id === orig.templateId) : null;
  const first = (lead?.name ?? person?.name ?? "").split(" ")[0];
  const vars: Record<string, string> = lead ? leadVars(lead) : { student_name: first, lead_name: first };
  // Full bodies live in storage (contentReference); re-render from the template when we have one.
  const text = tpl ? renderTemplate(tpl.content, vars) : orig.preview;
  const rec = await sendMessage({
    channel: orig.channel, to, subject: tpl?.subject ? renderTemplate(tpl.subject, vars) : null, text, templateId: orig.templateId,
    providerTemplate: orig.channel === "whatsapp" ? { name: orig.templateId ?? "generic", variables: Object.values(vars) } : undefined,
    event: orig.event, userId: orig.userId, studentId: orig.studentId, leadId: orig.leadId,
  });
  await audit({ user: g.user, action: "message.retried", objectType: "Communication", objectId: orig.id, result: rec.status === "failed" ? "failed" : "success", meta: { newId: rec.id, status: rec.status } });
  revalidatePath("/academy/marketing/communications");
  if (lead) revalidateGrowth(lead.id);
  return rec.status === "failed" || rec.status === "skipped"
    ? { ok: false, error: `Retry ${rec.status}: ${rec.error ?? "unknown error"}`, at: Date.now() }
    : { ok: true, message: `Retried — ${rec.status}.`, at: Date.now() };
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export async function saveTemplate(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("templates.manage");
  if (!g.user) return { ok: false, error: g.error };
  const id = str(form, "id", 60);
  const name = str(form, "name", 80);
  const channel = str(form, "channel") as T.CommChannel;
  const purpose = str(form, "purpose", 160);
  const event = str(form, "event", 60) || null;
  const category = str(form, "category") as T.NotificationCategory;
  const subject = str(form, "subject", 160) || null;
  const content = str(form, "content", 2000);
  const status = str(form, "status") as T.MessageTemplate["status"];

  const fe: Record<string, string> = {};
  if (name.length < 3) fe.name = "Name the template (3+ characters).";
  if (!["email", "whatsapp", "sms", "in_app"].includes(channel)) fe.channel = "Choose a channel.";
  if (!["marketing", "learning", "announcements", "payments", "system", "security"].includes(category)) fe.category = "Choose a category.";
  if (!["active", "draft", "archived"].includes(status)) fe.status = "Choose a status.";
  if (event && !/^[a-z_]+\.[a-z_]+$/.test(event)) fe.event = "Choose an event from the list.";
  if (channel === "email" && !subject) fe.subject = "Email templates need a subject line.";
  if (content.length < 5) fe.content = "Write the message (5+ characters).";
  const variables = Array.from(new Set([...(content.match(/{{\s*\w+\s*}}/g) ?? []), ...((subject ?? "").match(/{{\s*\w+\s*}}/g) ?? [])].map((v) => v.replace(/[{}\s]/g, ""))));
  const unknown = variables.filter((v) => !TEMPLATE_VARIABLES.includes(v));
  if (unknown.length) fe.content = `Unknown variable${unknown.length > 1 ? "s" : ""}: ${unknown.map((u) => `{{${u}}}`).join(", ")}. Pick from the variable list.`;
  if (Object.keys(fe).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fe, at: Date.now(), values: vals(form) };

  let t = id ? db().templates.find((x) => x.id === id) : undefined;
  if (id && !t) return { ok: false, error: "This template no longer exists." };
  const created = !t;
  if (!t) {
    t = { id: newId("tpl"), name, channel, purpose, event, category, subject, content, variables, status, approval: channel === "whatsapp" ? "pending" : "not_required" };
    db().templates.push(t);
  } else {
    const contentChanged = t.content !== content || t.channel !== channel;
    const approval: T.MessageTemplate["approval"] = channel !== "whatsapp" ? "not_required" : contentChanged || t.approval === "not_required" ? "pending" : t.approval;
    Object.assign(t, { name, channel, purpose, event, category, subject, content, variables, status, approval });
  }
  await audit({ user: g.user, action: "template.updated", objectType: "MessageTemplate", objectId: t.id, meta: { created, channel, approval: t.approval } });
  revalidatePath("/academy/marketing/templates");
  redirect(`/academy/marketing/templates?saved=${t.id}`);
}

/* ------------------------------------------------------------------ */
/* Content studio                                                      */
/* ------------------------------------------------------------------ */

export async function createContent(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("marketing.content");
  if (!g.user) return { ok: false, error: g.error };
  const kind = str(form, "kind") as T.ContentKind;
  const title = str(form, "title", 140);
  const fe: Record<string, string> = {};
  if (!KINDS.includes(kind)) fe.kind = "Choose a content type.";
  if (title.length < 3) fe.title = "Give it a working title (3+ characters).";
  if (Object.keys(fe).length) return { ok: false, fieldErrors: fe, at: Date.now(), values: vals(form) };
  const aiAssisted = form.get("aiAssisted") === "1";
  const item: T.ContentItem = { id: newId("cnt"), area: "marketing", kind, title, status: "draft", ownerId: g.user.id, courseId: null, updatedAt: now(), aiAssisted };
  db().content.push(item);
  await audit({ user: g.user, action: "content.created", objectType: "ContentItem", objectId: item.id, meta: { kind, aiAssisted } });
  revalidatePath("/academy/marketing/content");
  redirect(`/academy/marketing/content?saved=${item.id}`);
}

const TRANSITIONS: Record<string, { from: T.PublishState[]; to: T.PublishState }> = {
  submit: { from: ["draft"], to: "review" },
  approve: { from: ["review"], to: "approved" },
  changes: { from: ["review", "approved"], to: "draft" },
  publish: { from: ["approved"], to: "published" },
  archive: { from: ["draft", "review", "approved", "published"], to: "archived" },
  restore: { from: ["archived"], to: "draft" },
};

export async function transitionContent(form: FormData): Promise<void> {
  const g = await guard("marketing.content");
  if (!g.user) return;
  const item = db().content.find((c) => c.id === str(form, "id", 60) && c.area === "marketing");
  const action = str(form, "action", 20);
  const rule = TRANSITIONS[action];
  if (!item || !rule || !rule.from.includes(item.status)) return;
  const from = item.status;
  item.status = rule.to;
  item.updatedAt = now();
  await audit({ user: g.user, action: `content.${action}`, objectType: "ContentItem", objectId: item.id, meta: { from, to: rule.to, aiAssisted: item.aiAssisted } });
  revalidatePath("/academy/marketing/content");
}

export async function aiContentDraft(_prev: FormState, form: FormData): Promise<FormState> {
  const g = await guard("marketing.content");
  if (!g.user) return { ok: false, error: g.error };
  const kind = str(form, "kind", 30);
  const title = str(form, "title", 140);
  if (title.length < 3) return { ok: false, fieldErrors: { title: "Add a working title first so the draft has a topic." }, at: Date.now(), values: vals(form) };
  const ai = integrationStatuses().find((i) => i.key === "ai");
  if (!ai?.configured) {
    return { ok: false, error: "AI features are not switched on yet. A Super Admin can connect a provider in Integrations. You can still write the draft yourself.", at: Date.now(), values: vals(form) };
  }
  const res = await askAI(g.user, {
    purpose: "marketing.content_draft",
    contextId: "brand",
    prompt: `Draft a ${kind.replace("_", " ")} titled "${title}" for EMC, a medical coding academy in India. Keep claims factual and modest; no guarantees of jobs or certifications.`,
  });
  if (!res.ok) return { ok: false, error: res.reason, at: Date.now(), values: vals(form) };
  return { ok: true, draft: res.draft, draftLabel: res.label, at: Date.now(), values: vals(form) };
}
