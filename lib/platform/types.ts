/**
 * EMC Digital Academy — domain model.
 *
 * Shared by server and client. Mirrors prisma/schema.prisma so the demo store
 * can be swapped for PostgreSQL without touching screens.
 * Never put secrets or password hashes on types that are sent to the browser:
 * `User` (server) vs `SessionUser` / `PublicUser` (client-safe).
 */

/* ------------------------------------------------------------------ */
/* Identity & access                                                   */
/* ------------------------------------------------------------------ */

export type RoleKey = "student" | "faculty" | "marketing" | "admin";

export type Permission =
  | "learning.access"
  | "students.view"
  | "students.create"
  | "students.edit"
  | "students.delete"
  | "courses.view"
  | "courses.create"
  | "courses.edit"
  | "courses.publish"
  | "content.manage"
  | "assessments.manage"
  | "assignments.review"
  | "attendance.manage"
  | "faculty.manage"
  | "batches.manage"
  | "admissions.manage"
  | "certificates.manage"
  | "leads.view"
  | "leads.edit"
  | "campaigns.manage"
  | "marketing.content"
  | "communications.send"
  | "templates.manage"
  | "analytics.view"
  | "finance.view"
  | "finance.manage"
  | "audit.view"
  | "integrations.manage"
  | "settings.manage"
  | "users.manage"
  | "system.manage";

export type UserStatus = "active" | "disabled" | "invited";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: RoleKey;
  /** Extra grants beyond the role (permission-based, not role-based, authorization). */
  extraPermissions: Permission[];
  status: UserStatus;
  passwordHash: string;
  mfaEnabled: boolean;
  title: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/** What the browser is allowed to know about the signed-in user. */
export interface SessionUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: RoleKey;
  title: string | null;
  initials: string;
  permissions: Permission[];
}

export type PublicUser = Omit<User, "passwordHash">;

/* ------------------------------------------------------------------ */
/* Academic structure: Program → Course → Module → Lesson             */
/* ------------------------------------------------------------------ */

export type PublishState = "draft" | "review" | "approved" | "published" | "archived";

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  courseIds: string[];
}

export interface Course {
  id: string;
  programId: string;
  code: string;
  title: string;
  description: string;
  status: PublishState;
  facultyIds: string[];
  /** Requirements to earn the program certificate (editable by admin). */
  certificateRule: { minCompletion: number; minAverageScore: number };
}

export interface Module {
  id: string;
  courseId: string;
  order: number;
  title: string;
}

export type LessonType = "video" | "text" | "pdf" | "slides" | "interactive" | "quiz" | "practice" | "lab";

export type LessonBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "example"; title: string; text: string };

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  type: LessonType;
  durationMin: number;
  status: PublishState;
  summary: string;
  blocks: LessonBlock[];
  resources: { label: string; kind: "pdf" | "slides" | "link" | "sheet"; storageKey: string }[];
  /** Object-storage key for video lessons. Played through signed URLs, never stored in the DB. */
  videoKey?: string;
}

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgress {
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  percent: number;
  positionSec: number;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Delivery: batches, sessions, attendance                            */
/* ------------------------------------------------------------------ */

export interface Batch {
  id: string;
  name: string;
  programId: string;
  facultyIds: string[];
  studentIds: string[];
  startDate: string;
  endDate: string;
  capacity: number;
  schedule: string;
  status: "planned" | "active" | "completed";
}

export interface ClassSession {
  id: string;
  batchId: string;
  courseId: string;
  title: string;
  startsAt: string;
  durationMin: number;
  facultyId: string;
  mode: "online" | "classroom";
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  programId: string;
  batchId: string;
  enrolledAt: string;
  status: "active" | "paused" | "completed";
}

/* ------------------------------------------------------------------ */
/* Assignments & assessments                                          */
/* ------------------------------------------------------------------ */

export interface Assignment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  dueAt: string;
  maxScore: number;
  attachments: { label: string; storageKey: string }[];
  createdBy: string;
}

export type SubmissionStatus = "not_started" | "in_progress" | "submitted" | "under_review" | "returned" | "completed";

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  text: string;
  files: { name: string; storageKey: string; sizeKb: number }[];
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
  reviewedBy: string | null;
  revision: number;
}

export type AssessmentKind = "quiz" | "module" | "mock" | "practice" | "final";
export type QuestionType = "single" | "multiple" | "true_false" | "scenario" | "short" | "coding_case";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  scenario?: string;
  options: string[];
  correct: number[];
  /** For short-answer questions. */
  acceptedAnswers?: string[];
  points: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  kind: AssessmentKind;
  durationMin: number;
  opensAt: string;
  closesAt: string;
  maxAttempts: number;
  passMark: number;
  status: PublishState;
  questions: Question[];
  createdBy: string;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  studentId: string;
  answers: Record<string, number[] | string>;
  score: number;
  maxScore: number;
  startedAt: string;
  submittedAt: string;
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export interface Certificate {
  /** Public verification code, e.g. EMC-2026-7F3K9Q. */
  id: string;
  studentId: string;
  programId: string;
  templateId: string;
  issuedAt: string;
  issuedBy: string;
  status: "valid" | "revoked";
  revokedReason: string | null;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft";
}

/* ------------------------------------------------------------------ */
/* Growth: leads, campaigns, content                                  */
/* ------------------------------------------------------------------ */

export type LeadStatus =
  | "new"
  | "contacted"
  | "counselling"
  | "demo_booked"
  | "demo_completed"
  | "application"
  | "converted"
  | "lost";

export type LeadSource = "website" | "google" | "meta" | "instagram" | "whatsapp" | "email" | "organic" | "referral" | "walk_in" | "other";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  programInterest: string | null;
  education: string | null;
  source: LeadSource;
  campaignId: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  whatsappOptIn: boolean;
  lostReason: string | null;
}

export type ActivityType = "call" | "email" | "whatsapp" | "sms" | "note" | "status" | "counselling" | "demo" | "task" | "form";

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  summary: string;
  at: string;
  by: string | null;
}

export type Channel = "google" | "meta" | "instagram" | "whatsapp" | "email" | "organic" | "referral" | "other";

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: "draft" | "active" | "paused" | "ended";
  budget: number;
  spend: number;
  conversions: number;
  revenue: number;
  startDate: string;
  endDate: string | null;
}

export type ContentKind =
  | "blog"
  | "landing_page"
  | "social_post"
  | "email_campaign"
  | "whatsapp_campaign"
  | "announcement"
  | "seo"
  | "promo"
  | "lesson"
  | "video"
  | "document"
  | "resource"
  | "assignment"
  | "quiz"
  | "practice_case"
  | "lab_case";

export interface ContentItem {
  id: string;
  area: "academic" | "marketing";
  kind: ContentKind;
  title: string;
  status: PublishState;
  ownerId: string;
  courseId: string | null;
  updatedAt: string;
  aiAssisted: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "students" | "faculty" | "batch";
  batchId: string | null;
  createdBy: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Admissions & finance                                               */
/* ------------------------------------------------------------------ */

export type AdmissionStage = "application" | "counselling" | "documents" | "payment" | "admitted" | "batch_assigned" | "enrolled";

export interface Admission {
  id: string;
  leadId: string | null;
  name: string;
  phone: string;
  programId: string;
  stage: AdmissionStage;
  documentsComplete: boolean;
  batchId: string | null;
  updatedAt: string;
}

export type InvoiceStatus = "paid" | "partially_paid" | "pending" | "overdue" | "refunded";

export interface Invoice {
  id: string;
  number: string;
  studentId: string;
  description: string;
  amount: number;
  paid: number;
  currency: "INR";
  dueDate: string;
  status: InvoiceStatus;
  installments: { label: string; amount: number; dueDate: string; paid: boolean }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: "upi" | "card" | "netbanking" | "cash" | "bank_transfer";
  provider: string | null;
  providerRef: string | null;
  status: "succeeded" | "failed" | "refunded";
}

/* ------------------------------------------------------------------ */
/* Communication                                                       */
/* ------------------------------------------------------------------ */

export type CommChannel = "email" | "whatsapp" | "sms" | "in_app";
export type CommStatus = "queued" | "sent" | "delivered" | "read" | "failed" | "skipped";

/** One record shape for every channel and provider. */
export interface Communication {
  id: string;
  userId: string | null;
  leadId: string | null;
  studentId: string | null;
  channel: CommChannel;
  provider: string;
  templateId: string | null;
  direction: "outbound" | "inbound";
  status: CommStatus;
  providerMessageId: string | null;
  /** A short preview; full bodies live in storage, referenced by contentReference. */
  preview: string;
  contentReference: string | null;
  event: string | null;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  error: string | null;
}

export type NotificationCategory = "learning" | "marketing" | "announcements" | "payments" | "system" | "security";

export interface MessageTemplate {
  id: string;
  name: string;
  channel: CommChannel;
  purpose: string;
  event: string | null;
  category: NotificationCategory;
  subject: string | null;
  content: string;
  variables: string[];
  status: "active" | "draft" | "archived";
  /** WhatsApp templates need provider approval before use. */
  approval: "not_required" | "pending" | "approved" | "rejected";
}

export interface AppNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPreference {
  userId: string;
  category: NotificationCategory;
  channel: CommChannel;
  enabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Platform                                                            */
/* ------------------------------------------------------------------ */

export interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  objectType: string;
  objectId: string | null;
  result: "success" | "denied" | "failed";
  meta: Record<string, string | number | boolean | null>;
  at: string;
  ip: string | null;
}

export type IntegrationCategory = "communication" | "ai" | "payments" | "storage" | "analytics" | "authentication";

export interface IntegrationStatus {
  key: string;
  category: IntegrationCategory;
  label: string;
  provider: string;
  configured: boolean;
  status: "connected" | "not_configured" | "error" | "simulated";
  lastSuccessAt: string | null;
  lastError: string | null;
}

export interface WebhookEvent {
  id: string;
  source: string;
  externalId: string;
  type: string;
  receivedAt: string;
  status: "processed" | "duplicate" | "rejected" | "failed";
  note: string | null;
}

export interface AIRequest {
  id: string;
  userId: string;
  provider: string;
  model: string | null;
  purpose: string;
  contextType: "student" | "course" | "lesson" | "assessment" | "faculty" | "marketing" | "lead";
  status: "completed" | "failed" | "blocked" | "not_configured";
  inputReference: string | null;
  outputReference: string | null;
  tokens: number | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  kind: "class" | "assessment" | "assignment" | "event" | "deadline" | "counselling";
  startsAt: string;
  endsAt: string | null;
  href: string | null;
  meta: string | null;
}
