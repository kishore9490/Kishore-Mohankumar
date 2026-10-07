/**
 * Provider-agnostic analytics.
 *
 * `track()` pushes to `window.dataLayer` (Google Tag Manager / GA4 if
 * configured) and emits a DOM `showroom:analytics` event so any other provider
 * can subscribe without touching component code. No provider is hard-wired.
 */
export type AnalyticsEvent =
  | "bike_view"
  | "bike_compare"
  | "bike_filter"
  | "recommendation_shown"
  | "emi_calculation"
  | "test_ride_started"
  | "test_ride_completed"
  | "service_booking_started"
  | "service_booking_completed"
  | "service_track"
  | "onroad_price_request"
  | "finance_request"
  | "whatsapp_click"
  | "phone_click"
  | "directions_click"
  | "accessory_enquiry"
  | "configurator_change";

type Props = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props, ts: Date.now() };
  window.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("showroom:analytics", { detail: payload }));
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", payload);
}
