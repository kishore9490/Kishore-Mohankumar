import "server-only";
import { db } from "@/server/db/store";
import { integrationStatuses } from "@/integrations/registry";
import { emailProvider } from "@/integrations/email";
import { whatsappProvider } from "@/integrations/whatsapp";
import { smsProvider } from "@/integrations/sms";
import { aiProvider } from "@/integrations/ai";
import { paymentProvider } from "@/integrations/payments";
import { storageProvider } from "@/integrations/storage";
import { analyticsProvider } from "@/integrations/analytics";
import { permissionsFor, ROLES } from "@/lib/platform/rbac";
import type * as T from "@/lib/platform/types";
import { isSameDay } from "./learning";

/**
 * Read models for the Super Admin (EMC Command Center).
 * Screens call these; they never touch the store directly, and nothing here
 * ever returns a password hash.
 */

const DAY = 86_400_000;
const now = () => Date.now();
const ts = (iso: string) => new Date(iso).getTime();

/* ------------------------------------------------------------------ */
/* Identity                                                           */
/* ------------------------------------------------------------------ */

export function toPublicUser(u: T.User): T.PublicUser {
  // Explicit copy so a password hash can never leak through a spread.
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, extraPermissions: [...u.extraPermissions],
    status: u.status, mfaEnabled: u.mfaEnabled, title: u.title, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
  };
}

export const adminUserById = (id: string) => {
  const u = db().users.find((x) => x.id === id);
  return u ? toPublicUser(u) : null;
};
export const nameOf = (id: string | null | undefined) => (id ? db().users.find((u) => u.id === id)?.name ?? "—" : "—");
export const programName = (id: string) => db().programs.find((p) => p.id === id)?.name ?? "—";
export const programs = () => db().programs;
export const facultyUsers = () => db().users.filter((u) => u.role === "faculty").map(toPublicUser);
export const activeStudents = () => db().users.filter((u) => u.role === "student" && u.status === "active").map(toPublicUser);

export function listUsers(filter: { role?: string; q?: string; status?: string }) {
  const q = (filter.q ?? "").trim().toLowerCase();
  const all = db().users;
  const counts = {
    all: all.length,
    student: all.filter((u) => u.role === "student").length,
    faculty: all.filter((u) => u.role === "faculty").length,
    marketing: all.filter((u) => u.role === "marketing").length,
    admin: all.filter((u) => u.role === "admin").length,
  };
  const rows = all
    .filter((u) => !filter.role || filter.role === "all" || u.role === filter.role)
    .filter((u) => !filter.status || filter.status === "all" || u.status === filter.status)
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || "§"))
    .sort((a, b) => (a.role === b.role ? a.name.localeCompare(b.name) : roleOrder(a.role) - roleOrder(b.role)))
    .map(toPublicUser);
  return { rows, counts };
}
const roleOrder = (r: T.RoleKey) => ["admin", "faculty", "marketing", "student"].indexOf(r);

/** Everything the "Manage user" panel needs, scoped to this one user. */
export function userWorkspace(id: string) {
  const d = db();
  const u = d.users.find((x) => x.id === id);
  if (!u) return null;
  const enrollments = d.enrollments.filter((e) => e.studentId === id).map((e) => ({ ...e, batch: d.batches.find((b) => b.id === e.batchId) ?? null }));
  return {
    user: toPublicUser(u),
    permissions: permissionsFor(u.role, u.extraPermissions),
    courses: d.courses.filter((c) => c.facultyIds.includes(id)),
    batches: d.batches.filter((b) => b.facultyIds.includes(id) || b.studentIds.includes(id)),
    enrollments,
    activeSessions: d.authSessions.filter((s) => s.userId === id && !s.revokedAt && ts(s.expiresAt) > now()).length,
    recent: d.auditLogs.filter((a) => a.objectId === id || a.userId === id).slice(0, 6),
  };
}

/** Staff and anyone holding extra grants — the people whose access is worth reviewing. */
export function permissionHolders() {
  return db()
    .users.filter((u) => u.role !== "student" || u.extraPermissions.length > 0)
    .map((u) => ({ user: toPublicUser(u), bundle: ROLES[u.role].permissions, extra: u.extraPermissions }))
    .sort((a, b) => roleOrder(a.user.role) - roleOrder(b.user.role));
}

/* ------------------------------------------------------------------ */
/* Academic                                                           */
/* ------------------------------------------------------------------ */

export function courseCatalog() {
  const d = db();
  return d.programs.map((p) => ({
    program: p,
    courses: d.courses
      .filter((c) => c.programId === p.id)
      .map((c) => {
        const mods = d.modules.filter((m) => m.courseId === c.id);
        const lessons = d.lessons.filter((l) => mods.some((m) => m.id === l.moduleId));
        return { course: c, modules: mods.length, lessons: lessons.length, faculty: c.facultyIds.map((f) => ({ id: f, name: nameOf(f) })) };
      }),
  }));
}

export const courseById = (id: string) => db().courses.find((c) => c.id === id) ?? null;

export function academicReviewQueue() {
  const d = db();
  return d.content
    .filter((c) => c.area === "academic" && (c.status === "review" || c.status === "approved"))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .map((c) => ({ item: c, owner: nameOf(c.ownerId), course: c.courseId ? d.courses.find((x) => x.id === c.courseId)?.title ?? "—" : "—" }));
}

/* ------------------------------------------------------------------ */
/* Batches                                                            */
/* ------------------------------------------------------------------ */

function attendancePct(sessionIds: Set<string>) {
  const rows = db().attendance.filter((a) => sessionIds.has(a.sessionId));
  if (!rows.length) return null;
  return Math.round((rows.filter((r) => r.status === "present" || r.status === "late").length / rows.length) * 100);
}

/** Program lesson ids (published) for completion maths. */
function programLessonIds(programId: string) {
  const d = db();
  const p = d.programs.find((x) => x.id === programId);
  if (!p) return new Set<string>();
  const mods = new Set(d.modules.filter((m) => p.courseIds.includes(m.courseId)).map((m) => m.id));
  return new Set(d.lessons.filter((l) => mods.has(l.moduleId) && l.status === "published").map((l) => l.id));
}

function studentCompletion(studentId: string, lessonIds: Set<string>) {
  if (!lessonIds.size) return 0;
  const done = db().progress.filter((p) => p.userId === studentId && p.status === "completed" && lessonIds.has(p.lessonId)).length;
  return Math.round((done / lessonIds.size) * 100);
}

export function batchRows() {
  const d = db();
  return d.batches.map((b) => {
    const sessions = d.sessions.filter((s) => s.batchId === b.id);
    const lessonIds = programLessonIds(b.programId);
    const completion = b.studentIds.length ? Math.round(b.studentIds.reduce((s, id) => s + studentCompletion(id, lessonIds), 0) / b.studentIds.length) : null;
    return {
      batch: b,
      program: programName(b.programId),
      faculty: b.facultyIds.map(nameOf),
      fill: b.capacity ? Math.round((b.studentIds.length / b.capacity) * 100) : 0,
      attendance: attendancePct(new Set(sessions.map((s) => s.id))),
      completion,
      sessions: sessions.length,
      nextSession: sessions.filter((s) => ts(s.startsAt) > now()).sort((a, c) => a.startsAt.localeCompare(c.startsAt))[0] ?? null,
    };
  });
}

export function batchDetail(id: string) {
  const d = db();
  const b = d.batches.find((x) => x.id === id);
  if (!b) return null;
  const sessions = d.sessions.filter((s) => s.batchId === id).sort((a, c) => a.startsAt.localeCompare(c.startsAt));
  const lessonIds = programLessonIds(b.programId);
  const students = b.studentIds.map((sid) => {
    const u = d.users.find((x) => x.id === sid);
    const att = d.attendance.filter((a) => a.studentId === sid && sessions.some((s) => s.id === a.sessionId));
    const inv = d.invoices.find((i) => i.studentId === sid) ?? null;
    return {
      id: sid,
      name: u?.name ?? "Unknown",
      email: u?.email ?? "",
      status: u?.status ?? "disabled",
      attendance: att.length ? Math.round((att.filter((a) => a.status === "present" || a.status === "late").length / att.length) * 100) : null,
      completion: studentCompletion(sid, lessonIds),
      invoice: inv ? inv.status : null,
    };
  });
  return {
    batch: b,
    program: programName(b.programId),
    faculty: b.facultyIds.map((f) => ({ id: f, name: nameOf(f) })),
    students,
    past: sessions.filter((s) => ts(s.startsAt) < now()).reverse(),
    upcoming: sessions.filter((s) => ts(s.startsAt) >= now()),
    attendance: attendancePct(new Set(sessions.map((s) => s.id))),
    courseTitle: (cid: string) => d.courses.find((c) => c.id === cid)?.title ?? "—",
  };
}

export const batchesForSelect = () => db().batches.map((b) => ({ id: b.id, name: b.name, programId: b.programId, full: b.studentIds.length >= b.capacity, status: b.status }));

/* ------------------------------------------------------------------ */
/* Admissions                                                         */
/* ------------------------------------------------------------------ */

export const ADMISSION_STAGES: { key: T.AdmissionStage; label: string; hint: string }[] = [
  { key: "application", label: "Application", hint: "Form received" },
  { key: "counselling", label: "Counselling", hint: "Fit & program advice" },
  { key: "documents", label: "Documents", hint: "Eligibility proofs" },
  { key: "payment", label: "Payment", hint: "Fee or first instalment" },
  { key: "admitted", label: "Admitted", hint: "Offer accepted" },
  { key: "batch_assigned", label: "Batch assigned", hint: "Seat reserved" },
  { key: "enrolled", label: "Enrolled", hint: "Account created" },
];

export function admissionsBoard() {
  const d = db();
  const rows = d.admissions.map((a) => ({
    admission: a,
    program: programName(a.programId),
    batch: a.batchId ? d.batches.find((b) => b.id === a.batchId)?.name ?? null : null,
    leadSource: a.leadId ? d.leads.find((l) => l.id === a.leadId)?.source ?? null : null,
  }));
  return ADMISSION_STAGES.map((s) => ({ ...s, items: rows.filter((r) => r.admission.stage === s.key).sort((a, b) => b.admission.updatedAt.localeCompare(a.admission.updatedAt)) }));
}

/* ------------------------------------------------------------------ */
/* Finance                                                            */
/* ------------------------------------------------------------------ */

export const outstanding = (i: T.Invoice) => (i.status === "refunded" ? 0 : Math.max(0, i.amount - i.paid));
export const isOverdue = (i: T.Invoice) => i.status === "overdue" || (outstanding(i) > 0 && ts(i.dueDate) < now());

export function financeOverview(status?: string) {
  const d = db();
  const invoices = d.invoices.map((i) => ({ invoice: i, student: nameOf(i.studentId), overdue: isOverdue(i) }));
  const succeeded = d.payments.filter((p) => p.status === "succeeded");
  const totals = {
    billed: d.invoices.reduce((s, i) => s + i.amount, 0),
    collected: succeeded.reduce((s, p) => s + p.amount, 0),
    outstanding: d.invoices.reduce((s, i) => s + outstanding(i), 0),
    overdue: invoices.filter((r) => r.overdue).reduce((s, r) => s + outstanding(r.invoice), 0),
    overdueCount: invoices.filter((r) => r.overdue).length,
    refunded: d.payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
  };
  const counts: Record<string, number> = { all: invoices.length };
  for (const r of invoices) counts[r.invoice.status] = (counts[r.invoice.status] ?? 0) + 1;
  const filtered = invoices
    .filter((r) => !status || status === "all" || (status === "overdue" ? r.overdue : r.invoice.status === status))
    .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.invoice.dueDate.localeCompare(b.invoice.dueDate));
  const payments = [...d.payments]
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    .slice(0, 10)
    .map((p) => {
      const inv = d.invoices.find((i) => i.id === p.invoiceId);
      return { payment: p, invoiceNumber: inv?.number ?? "—", student: nameOf(inv?.studentId) };
    });
  return { invoices: filtered, totals, counts, payments };
}

export function invoiceDetail(id: string) {
  const d = db();
  const i = d.invoices.find((x) => x.id === id);
  if (!i) return null;
  return { invoice: i, student: nameOf(i.studentId), payments: d.payments.filter((p) => p.invoiceId === id).sort((a, b) => b.paidAt.localeCompare(a.paidAt)), overdue: isOverdue(i) };
}

/* ------------------------------------------------------------------ */
/* Certificates                                                       */
/* ------------------------------------------------------------------ */

export function certificateOverview() {
  const d = db();
  return {
    templates: d.certificateTemplates.map((t) => ({ template: t, issued: d.certificates.filter((c) => c.templateId === t.id).length })),
    certificates: [...d.certificates]
      .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
      .map((c) => ({ certificate: c, student: nameOf(c.studentId), program: programName(c.programId), template: d.certificateTemplates.find((t) => t.id === c.templateId)?.name ?? "—" })),
    history: d.auditLogs.filter((a) => a.objectType === "Certificate").slice(0, 12),
  };
}

export const certificateById = (id: string) => db().certificates.find((c) => c.id === id) ?? null;

/* ------------------------------------------------------------------ */
/* Communications                                                     */
/* ------------------------------------------------------------------ */

export const ALL_EVENTS = [
  "student.enrolled", "course.assigned", "class.scheduled", "assignment.created", "assignment.due", "assignment.reviewed",
  "assessment.scheduled", "assessment.completed", "certificate.issued", "lead.created", "lead.status_changed", "demo.booked",
  "demo.completed", "payment.received", "payment.overdue", "announcement.published", "auth.password_reset",
] as const;

export function communicationsOverview() {
  const d = db();
  const channels: T.CommChannel[] = ["email", "whatsapp", "sms", "in_app"];
  const byChannel = channels.map((ch) => {
    const rows = d.communications.filter((c) => c.channel === ch);
    return {
      channel: ch,
      total: rows.length,
      delivered: rows.filter((c) => ["sent", "delivered", "read"].includes(c.status)).length,
      read: rows.filter((c) => c.status === "read").length,
      failed: rows.filter((c) => c.status === "failed").length,
      skipped: rows.filter((c) => c.status === "skipped").length,
    };
  });
  const recipient = (c: T.Communication) =>
    c.userId ? nameOf(c.userId) : c.leadId ? `${d.leads.find((l) => l.id === c.leadId)?.name ?? "Lead"} (lead)` : "—";
  const recent = [...d.communications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 14).map((c) => ({ c, recipient: recipient(c), template: d.templates.find((t) => t.id === c.templateId)?.name ?? null }));
  const failed = d.communications.filter((c) => c.status === "failed").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((c) => ({ c, recipient: recipient(c), template: d.templates.find((t) => t.id === c.templateId)?.name ?? null }));
  const skipped = d.communications.filter((c) => c.status === "skipped").length;
  const eventMap = ALL_EVENTS.map((e) => ({ event: e, templates: d.templates.filter((t) => t.event === e) }));
  return {
    byChannel,
    recent,
    failed,
    skipped,
    templates: { total: d.templates.length, active: d.templates.filter((t) => t.status === "active").length, pendingApproval: d.templates.filter((t) => t.approval === "pending").length },
    eventMap,
  };
}

/* ------------------------------------------------------------------ */
/* Integrations                                                       */
/* ------------------------------------------------------------------ */

/**
 * Environment variable NAMES each adapter reads (mirrors integrations/*). Values
 * are never read here — only names, so a Super Admin knows what to ask for.
 */
export const INTEGRATION_ENV: Record<string, { selector: string | null; options: { provider: string; env: string[] }[]; note: string }> = {
  email: {
    selector: "EMAIL_PROVIDER",
    note: "Defaults to the simulated provider, which records messages and sends nothing.",
    options: [
      { provider: "Brevo", env: ["BREVO_API_KEY", "EMAIL_FROM"] },
      { provider: "SendGrid", env: ["SENDGRID_API_KEY", "EMAIL_FROM"] },
      { provider: "Amazon SES", env: ["AWS_SES_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "EMAIL_FROM"] },
      { provider: "Microsoft Graph", env: ["MSGRAPH_TENANT_ID", "MSGRAPH_CLIENT_ID", "MSGRAPH_CLIENT_SECRET", "EMAIL_FROM"] },
      { provider: "SMTP", env: ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"] },
    ],
  },
  whatsapp: {
    selector: "WHATSAPP_PROVIDER",
    note: "Only provider-approved templates can be sent. Delivery and read receipts arrive by webhook.",
    options: [
      { provider: "Meta WhatsApp Cloud API", env: ["WHATSAPP_META_TOKEN", "WHATSAPP_META_PHONE_NUMBER_ID", "WHATSAPP_WEBHOOK_SECRET"] },
      { provider: "WhatsApp BSP", env: ["WHATSAPP_BSP_API_KEY", "WHATSAPP_BSP_BASE_URL", "WHATSAPP_WEBHOOK_SECRET"] },
    ],
  },
  sms: {
    selector: "SMS_PROVIDER",
    note: "Indian SMS requires DLT-registered templates and a sender ID.",
    options: [
      { provider: "MSG91", env: ["MSG91_AUTH_KEY", "SMS_SENDER_ID"] },
      { provider: "Twilio", env: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "SMS_SENDER_ID"] },
    ],
  },
  ai: {
    selector: "AI_PROVIDER",
    note: "AI is off until configured. Every request is permission-scoped and logged without storing content.",
    options: [
      { provider: "OpenAI", env: ["OPENAI_API_KEY", "AI_MODEL"] },
      { provider: "Google Gemini", env: ["GEMINI_API_KEY", "AI_MODEL"] },
      { provider: "Anthropic", env: ["ANTHROPIC_API_KEY", "AI_MODEL"] },
    ],
  },
  payments: {
    selector: "PAYMENT_PROVIDER",
    note: "No gateway is integrated until configured. Offline payments are recorded by Finance.",
    options: [
      { provider: "Razorpay", env: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"] },
      { provider: "Stripe", env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
    ],
  },
  storage: {
    selector: "STORAGE_PROVIDER",
    note: "Files never live in the database — only object keys. Private files use short-lived signed URLs.",
    options: [
      { provider: "S3-compatible", env: ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] },
      { provider: "Cloudflare R2", env: ["R2_BUCKET", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"] },
      { provider: "Azure Blob", env: ["AZURE_STORAGE_ACCOUNT", "AZURE_STORAGE_KEY", "AZURE_CONTAINER"] },
    ],
  },
  analytics: {
    selector: "ANALYTICS_PROVIDER",
    note: "Platform events are logged in-process today; swap for PostHog, GA4 or a warehouse later.",
    options: [{ provider: "Internal event log", env: [] }],
  },
  auth: {
    selector: null,
    note: "Sessions are signed server-side and validated on every request. Two-step verification is required for Super Admin.",
    options: [{ provider: "Email + password (built-in)", env: ["AUTH_SECRET", "DATABASE_URL"] }],
  },
};

/** Provider key currently selected for each integration (no secrets). */
export function providerKeys(): Record<string, string> {
  return {
    email: emailProvider().key, whatsapp: whatsappProvider().key, sms: smsProvider().key, ai: aiProvider().key,
    payments: paymentProvider().key, storage: storageProvider().key, analytics: analyticsProvider().key, auth: "builtin",
  };
}

export function integrationsOverview() {
  const d = db();
  const lastTest = (key: string) => d.auditLogs.find((a) => a.action === "integration.tested" && a.objectId === key) ?? null;
  return {
    statuses: integrationStatuses().map((s) => ({ status: s, env: INTEGRATION_ENV[s.key], lastTest: lastTest(s.key) })),
    webhooks: d.webhookEvents.slice(0, 12),
    ai: d.aiRequests.slice(0, 10).map((r) => ({ id: r.id, purpose: r.purpose, status: r.status, provider: r.provider, createdAt: r.createdAt, user: nameOf(r.userId) })),
  };
}

/* ------------------------------------------------------------------ */
/* Audit                                                              */
/* ------------------------------------------------------------------ */

export function auditPage(filter: { q?: string; result?: string; user?: string; page?: number }, pageSize = 25) {
  const q = (filter.q ?? "").trim().toLowerCase();
  const rows = db().auditLogs.filter(
    (a) =>
      (!q || a.action.toLowerCase().startsWith(q) || a.action.toLowerCase().includes(q) || a.objectType.toLowerCase().includes(q) || (a.objectId ?? "").toLowerCase().includes(q)) &&
      (!filter.result || filter.result === "all" || a.result === filter.result) &&
      (!filter.user || filter.user === "all" || a.userId === filter.user),
  ).sort((a, b) => b.at.localeCompare(a.at));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, filter.page ?? 1), pages);
  const actors = Array.from(new Map(db().auditLogs.filter((a) => a.userId).map((a) => [a.userId!, a.userName ?? a.userId!])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pages, actors };
}

/* ------------------------------------------------------------------ */
/* Command center                                                     */
/* ------------------------------------------------------------------ */

export interface AttentionItem {
  key: string;
  tone: "danger" | "warning" | "info";
  title: string;
  detail: string;
  href: string;
  count: number;
}

export function commandCenter() {
  const d = db();
  const t = now();
  const students = d.users.filter((u) => u.role === "student");
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const fin = financeOverview();
  const overdue = d.invoices.filter(isOverdue);
  const failedComms = d.communications.filter((c) => c.status === "failed");
  const coursesInReview = d.courses.filter((c) => c.status === "draft" || c.status === "review");
  const contentInReview = d.content.filter((c) => c.area === "academic" && c.status === "review");
  const nearCapacity = d.batches.filter((b) => b.status !== "completed" && b.capacity > 0 && b.studentIds.length / b.capacity >= 0.85);
  const disabled = d.users.filter((u) => u.status === "disabled");
  const integrations = integrationStatuses();
  const notConfigured = integrations.filter((i) => i.status === "not_configured" || i.status === "error");
  const stale = d.submissions.filter((s) => (s.status === "submitted" || s.status === "under_review") && s.submittedAt && t - ts(s.submittedAt) > 3 * DAY);

  const attention: AttentionItem[] = [];
  const push = (a: AttentionItem) => a.count > 0 && attention.push(a);
  push({ key: "overdue", tone: "danger", count: overdue.length, title: `${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`, detail: `${fin.totals.overdue.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })} past due`, href: "/academy/admin/finance?status=overdue" });
  push({ key: "comms", tone: "danger", count: failedComms.length, title: `${failedComms.length} failed communication${failedComms.length === 1 ? "" : "s"}`, detail: failedComms[0]?.error ?? "Delivery failed", href: "/academy/admin/communications#failed" });
  push({ key: "stale", tone: "warning", count: stale.length, title: `${stale.length} submission${stale.length === 1 ? "" : "s"} waiting > 3 days`, detail: "Faculty review is overdue", href: "/academy/admin#faculty" });
  push({ key: "content", tone: "warning", count: contentInReview.length + coursesInReview.length, title: `${contentInReview.length + coursesInReview.length} item${contentInReview.length + coursesInReview.length === 1 ? "" : "s"} awaiting academic review`, detail: [coursesInReview.length && `${coursesInReview.length} draft course`, contentInReview.length && `${contentInReview.length} faculty submission${contentInReview.length === 1 ? "" : "s"}`].filter(Boolean).join(" · "), href: "/academy/admin/courses#review" });
  push({ key: "capacity", tone: "info", count: nearCapacity.length, title: `${nearCapacity.length} batch${nearCapacity.length === 1 ? "" : "es"} near capacity`, detail: nearCapacity.map((b) => `${b.name.split(" — ")[1] ?? b.name} ${b.studentIds.length}/${b.capacity}`).join(" · "), href: "/academy/admin/batches" });
  push({ key: "integrations", tone: "info", count: notConfigured.length, title: `${notConfigured.length} integration${notConfigured.length === 1 ? "" : "s"} not configured`, detail: notConfigured.map((i) => i.label).join(", "), href: "/academy/admin/integrations" });
  push({ key: "disabled", tone: "info", count: disabled.length, title: `${disabled.length} disabled account${disabled.length === 1 ? "" : "s"}`, detail: disabled.slice(0, 2).map((u) => u.name).join(", "), href: "/academy/admin/users?status=disabled" });

  /* today */
  const classesToday = d.sessions
    .filter((s) => isSameDay(s.startsAt))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((s) => ({ session: s, batch: d.batches.find((b) => b.id === s.batchId)?.name ?? "—", faculty: nameOf(s.facultyId), end: new Date(ts(s.startsAt) + s.durationMin * 60000).toISOString() }));
  const leadsToday = d.leads.filter((l) => isSameDay(l.createdAt));
  const paymentsToday = d.payments.filter((p) => p.status === "succeeded" && isSameDay(p.paidAt));

  /* health */
  const twoWeeks = new Set(d.sessions.filter((s) => ts(s.startsAt) < t && t - ts(s.startsAt) <= 14 * DAY).map((s) => s.id));
  const attendance = attendancePct(twoWeeks);
  const batches = batchRows();

  /* course performance: assessment attempts + reviewed assignment scores */
  const scores = new Map<string, number[]>();
  for (const a of d.attempts) {
    const asm = d.assessments.find((x) => x.id === a.assessmentId);
    if (asm && a.maxScore) scores.set(asm.courseId, [...(scores.get(asm.courseId) ?? []), (a.score / a.maxScore) * 100]);
  }
  for (const s of d.submissions) {
    if (s.score === null) continue;
    const asg = d.assignments.find((x) => x.id === s.assignmentId);
    if (asg && asg.maxScore) scores.set(asg.courseId, [...(scores.get(asg.courseId) ?? []), (s.score / asg.maxScore) * 100]);
  }
  const coursePerformance = d.courses
    .filter((c) => scores.has(c.id))
    .map((c) => {
      const v = scores.get(c.id)!;
      return { label: `${c.code} · ${c.title}`, value: Math.round(v.reduce((a, b) => a + b, 0) / v.length), note: `${v.length} scores` };
    })
    .sort((a, b) => b.value - a.value);

  /* faculty activity */
  const faculty = d.users
    .filter((u) => u.role === "faculty")
    .map((f) => ({
      id: f.id,
      name: f.name,
      title: f.title,
      reviews: d.submissions.filter((s) => s.reviewedBy === f.id && s.score !== null).length,
      sessions: d.sessions.filter((s) => s.facultyId === f.id && ts(s.startsAt) < t).length,
      pending: d.submissions.filter((s) => (s.status === "submitted" || s.status === "under_review") && d.assignments.find((a) => a.id === s.assignmentId)?.createdBy === f.id).length,
      lastLogin: f.lastLoginAt,
    }))
    .sort((a, b) => b.reviews + b.sessions - (a.reviews + a.sessions));

  /* pipeline */
  const board = admissionsBoard();
  const funnel = board.map((s, i) => ({ key: s.key, label: s.label, value: board.slice(i).reduce((n, x) => n + x.items.length, 0), href: `/academy/admin/admissions#${s.key}` }));

  const recentAudit = d.auditLogs.slice().sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return {
    metrics: {
      students: students.length,
      activeStudents: students.filter((u) => u.status === "active").length,
      enrolled: new Set(d.enrollments.filter((e) => e.status === "active").map((e) => e.studentId)).size,
      faculty: d.users.filter((u) => u.role === "faculty" && u.status === "active").length,
      coursesPublished: d.courses.filter((c) => c.status === "published").length,
      coursesDraft: d.courses.filter((c) => c.status === "draft" || c.status === "review").length,
      batchesActive: d.batches.filter((b) => b.status === "active").length,
      batchesPlanned: d.batches.filter((b) => b.status === "planned").length,
      leadsMonth: d.leads.filter((l) => ts(l.createdAt) >= monthStart.getTime()).length,
      leads30: d.leads.filter((l) => t - ts(l.createdAt) <= 30 * DAY).length,
      admissionsOpen: d.admissions.filter((a) => a.stage !== "enrolled").length,
      admissionsTotal: d.admissions.length,
      pendingTasks: attention.reduce((n, a) => n + a.count, 0),
    },
    finance: fin.totals,
    overdueInvoices: fin.invoices.filter((r) => r.overdue).slice(0, 4).map((r) => ({ id: r.invoice.id, number: r.invoice.number, student: r.student, amount: outstanding(r.invoice), dueDate: r.invoice.dueDate })),
    attention,
    today: { classes: classesToday, leads: leadsToday, payments: paymentsToday.map((p) => ({ payment: p, student: nameOf(d.invoices.find((i) => i.id === p.invoiceId)?.studentId) })) },
    health: { attendance, batches },
    coursePerformance,
    faculty,
    funnel,
    integrations,
    recentAudit,
  };
}

export const allCourses = () => db().courses;
