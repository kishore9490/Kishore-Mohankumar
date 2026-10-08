import type { ActivityType, Channel, CommChannel, CommStatus, ContentKind, LeadSource, LeadStatus } from "@/lib/platform/types";
import type { IconName } from "@/components/ui/Icon";
import { relative } from "@/lib/platform/format";

/** "x ago" that never shows a future time for past events (demo seed times can land later today). */
export const since = (iso: string) => (new Date(iso).getTime() > Date.now() - 60_000 ? "just now" : relative(iso));

/** Client-safe labels and option lists for the Growth area. */

export const LEAD_STATUSES: { key: LeadStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "counselling", label: "Counselling" },
  { key: "demo_booked", label: "Demo booked" },
  { key: "demo_completed", label: "Demo completed" },
  { key: "application", label: "Application" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];
export const leadStatusLabel = (s: LeadStatus) => LEAD_STATUSES.find((x) => x.key === s)?.label ?? s;

export const LEAD_SOURCES: { key: LeadSource; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "google", label: "Google" },
  { key: "meta", label: "Meta" },
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "organic", label: "Organic" },
  { key: "referral", label: "Referral" },
  { key: "walk_in", label: "Walk-in" },
  { key: "other", label: "Other" },
];
export const sourceLabel = (s: LeadSource) => LEAD_SOURCES.find((x) => x.key === s)?.label ?? s;

export const CAMPAIGN_CHANNELS: { key: Channel; label: string }[] = [
  { key: "google", label: "Google" },
  { key: "meta", label: "Meta" },
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "organic", label: "Organic" },
  { key: "referral", label: "Referral" },
  { key: "other", label: "Other" },
];
export const channelLabel = (c: Channel) => CAMPAIGN_CHANNELS.find((x) => x.key === c)?.label ?? c;

export const COMM_CHANNELS: { key: CommChannel; label: string; icon: IconName }[] = [
  { key: "email", label: "Email", icon: "mail" },
  { key: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { key: "sms", label: "SMS", icon: "phone" },
  { key: "in_app", label: "In-app", icon: "bell" },
];
export const commChannelLabel = (c: CommChannel) => COMM_CHANNELS.find((x) => x.key === c)?.label ?? c;
export const commChannelIcon = (c: CommChannel): IconName => COMM_CHANNELS.find((x) => x.key === c)?.icon ?? "message";

export const COMM_STATUSES: CommStatus[] = ["queued", "sent", "delivered", "read", "failed", "skipped"];

/** Activities a person can log by hand (status / form / sms are system-generated). */
export const LOGGABLE_ACTIVITIES: { key: ActivityType; label: string }[] = [
  { key: "call", label: "Call" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "note", label: "Note" },
  { key: "counselling", label: "Counselling" },
  { key: "demo", label: "Demo" },
  { key: "task", label: "Task" },
];

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  call: "Call", email: "Email", whatsapp: "WhatsApp", sms: "SMS", note: "Note", status: "Status change",
  counselling: "Counselling", demo: "Demo", task: "Task", form: "Enquiry",
};

export const ACTIVITY_ICON: Record<ActivityType, IconName> = {
  call: "phone",
  email: "mail",
  whatsapp: "whatsapp",
  sms: "message",
  note: "pen",
  status: "flag",
  counselling: "users",
  demo: "video",
  task: "clipboard",
  form: "file",
};

export const MARKETING_KINDS: { key: ContentKind; label: string; plural: string }[] = [
  { key: "blog", label: "Blog", plural: "Blog" },
  { key: "landing_page", label: "Landing page", plural: "Landing pages" },
  { key: "social_post", label: "Social post", plural: "Social posts" },
  { key: "email_campaign", label: "Email campaign", plural: "Email campaigns" },
  { key: "whatsapp_campaign", label: "WhatsApp campaign", plural: "WhatsApp campaigns" },
  { key: "announcement", label: "Announcement", plural: "Announcements" },
  { key: "seo", label: "SEO content", plural: "SEO content" },
  { key: "promo", label: "Promotional", plural: "Promotional content" },
];
export const kindLabel = (k: ContentKind) => MARKETING_KINDS.find((x) => x.key === k)?.label ?? k;

/** Variables a template may use. Mirrors TEMPLATE_VARIABLES in server/services/templates.ts. */
export const TEMPLATE_VARS = [
  "student_name", "course_name", "batch_name", "class_title", "class_date", "faculty_name",
  "assignment_title", "due_date", "payment_amount", "certificate_id", "verify_url",
  "lead_name", "lead_source", "reset_url",
] as const;

export const TEMPLATE_EVENTS = [
  "lead.created", "lead.status_changed", "demo.booked", "demo.completed",
  "student.enrolled", "course.assigned", "class.scheduled", "assignment.created", "assignment.due", "assignment.reviewed",
  "assessment.scheduled", "assessment.completed", "certificate.issued", "payment.received", "payment.overdue", "announcement.published",
] as const;

export const NOTIFICATION_CATEGORIES = ["marketing", "learning", "announcements", "payments", "system", "security"] as const;

export const FUNNEL_STAGES = [
  { key: "leads", label: "Leads" },
  { key: "counselling", label: "Counselling" },
  { key: "demo", label: "Demo" },
  { key: "application", label: "Application" },
  { key: "admission", label: "Admission" },
] as const;
export type FunnelStageKey = (typeof FUNNEL_STAGES)[number]["key"];

/** Extracts {{variable}} names from text. */
export function extractVars(text: string): string[] {
  return Array.from(new Set((text.match(/{{\s*\w+\s*}}/g) ?? []).map((v) => v.replace(/[{}\s]/g, ""))));
}
