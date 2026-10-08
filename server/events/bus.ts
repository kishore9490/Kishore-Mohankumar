import "server-only";
import { enqueue } from "@/server/jobs/queue";
import { analyticsProvider, type PlatformEvent } from "@/integrations/analytics";

/**
 * Domain events. Business code emits what happened; the notification engine,
 * analytics and future automations decide what to do about it.
 */
export type DomainEvent =
  | "student.enrolled"
  | "course.assigned"
  | "class.scheduled"
  | "assignment.created"
  | "assignment.due"
  | "assignment.reviewed"
  | "assessment.scheduled"
  | "assessment.completed"
  | "certificate.issued"
  | "lead.created"
  | "lead.status_changed"
  | "demo.booked"
  | "demo.completed"
  | "payment.received"
  | "payment.overdue"
  | "announcement.published";

export interface EventPayload {
  /** Who/what the event is about. */
  studentIds?: string[];
  userIds?: string[];
  leadId?: string;
  /** Template variables. */
  vars?: Record<string, string>;
  href?: string;
}

const analyticsMap: Partial<Record<DomainEvent, PlatformEvent>> = {
  "lead.created": "lead_created",
  "demo.booked": "demo_booked",
  "demo.completed": "demo_completed",
  "assessment.completed": "assessment_completed",
  "certificate.issued": "certificate_issued",
};

export async function emit(event: DomainEvent, payload: EventPayload) {
  const a = analyticsMap[event];
  if (a) analyticsProvider().track(a, { leadId: payload.leadId ?? null }).catch(() => {});
  // In-app notices are created inline so they appear immediately; external channels run in the background.
  const { processEvent } = await import("@/server/services/notifications");
  await processEvent(event, payload, { inAppOnly: true });
  enqueue("notifications.dispatch", { event, payload });
}
