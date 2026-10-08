import "server-only";
import type * as T from "@/lib/platform/types";
import { buildSeed } from "./seed";

/**
 * DATA STORE
 *
 * Demo mode (default, no DATABASE_URL): an in-memory store seeded with fictional
 * data. It lives for the life of the server process, so changes survive page
 * navigation but reset on restart.
 *
 * Production: implement the same repositories in server/repositories/* against
 * PostgreSQL via Prisma (schema in prisma/schema.prisma). Screens and services
 * only talk to repositories, never to this object directly.
 */
export interface AuthSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string | null;
  revokedAt: string | null;
}

export interface DB {
  users: T.User[];
  programs: T.Program[];
  courses: T.Course[];
  modules: T.Module[];
  lessons: T.Lesson[];
  progress: T.LessonProgress[];
  batches: T.Batch[];
  sessions: T.ClassSession[];
  attendance: T.AttendanceRecord[];
  enrollments: T.Enrollment[];
  assignments: T.Assignment[];
  submissions: T.Submission[];
  assessments: T.Assessment[];
  attempts: T.Attempt[];
  certificates: T.Certificate[];
  certificateTemplates: T.CertificateTemplate[];
  leads: T.Lead[];
  leadActivities: T.LeadActivity[];
  campaigns: T.Campaign[];
  content: T.ContentItem[];
  announcements: T.Announcement[];
  admissions: T.Admission[];
  invoices: T.Invoice[];
  payments: T.Payment[];
  communications: T.Communication[];
  templates: T.MessageTemplate[];
  notifications: T.AppNotification[];
  notificationPrefs: T.NotificationPreference[];
  auditLogs: T.AuditLog[];
  webhookEvents: T.WebhookEvent[];
  aiRequests: T.AIRequest[];
  authSessions: AuthSession[];
  loginAttempts: { key: string; at: number }[];
  passwordResets: { tokenHash: string; userId: string; expiresAt: number; usedAt: number | null }[];
}

const g = globalThis as unknown as { __emcDb?: DB };

export function db(): DB {
  if (!g.__emcDb) g.__emcDb = buildSeed();
  return g.__emcDb;
}

export const isDemoMode = () => !process.env.DATABASE_URL;

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
