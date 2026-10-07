/**
 * Provider-agnostic event tracking.
 * Events are pushed to `window.dataLayer` (GTM-compatible) and dispatched as a
 * DOM CustomEvent ("emc:track") so any analytics / CRM script can subscribe
 * without this codebase depending on a specific vendor.
 */
export type TrackEvent =
  | "course_view"
  | "course_enquiry"
  | "demo_started"
  | "demo_completed"
  | "counselling_started"
  | "counselling_completed"
  | "whatsapp_click"
  | "phone_click"
  | "fee_view"
  | "application_started"
  | "application_completed"
  | "quiz_completed"
  | "lab_submitted";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: TrackEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props, ts: Date.now() };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("emc:track", { detail: payload }));
  if (process.env.NODE_ENV === "development") console.debug("[track]", payload);
}
