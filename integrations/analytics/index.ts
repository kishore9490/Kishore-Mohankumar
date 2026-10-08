import "server-only";
import { env, log } from "../core";

export type PlatformEvent =
  | "page_view" | "course_view" | "course_started" | "lesson_started" | "lesson_completed"
  | "assessment_started" | "assessment_completed" | "assignment_submitted" | "certificate_issued"
  | "lead_created" | "demo_booked" | "demo_completed" | "admission_completed"
  | "whatsapp_clicked" | "email_sent" | "notification_opened";

export interface AnalyticsProvider {
  key: string;
  label: string;
  configured(): boolean;
  track(event: PlatformEvent, props: Record<string, string | number | boolean | null>): Promise<void>;
}

/** Default: in-process log. Swap for PostHog, GA4 Measurement Protocol, Segment, a warehouse, … */
const internal: AnalyticsProvider = {
  key: "internal",
  label: "Internal event log",
  configured: () => true,
  async track(event, props) {
    if (process.env.NODE_ENV === "development") log("analytics", event, props);
  },
};

const providers: Record<string, AnalyticsProvider> = { internal };

export function analyticsProvider(): AnalyticsProvider {
  return providers[env("ANALYTICS_PROVIDER") ?? "internal"] ?? internal;
}
