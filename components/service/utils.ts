import { bikes } from "@/data/bikes";
import { dealership } from "@/data/dealership";
import { serviceStages, serviceTypes } from "@/data/services";
import { formatSlot } from "@/lib/format";
import type { Bike, BikeColor, ServiceStage } from "@/lib/types";

/** Service-journey helpers shared by the showcase, booking, tracker and garage. */

export const DEMO_REGISTRATIONS = ["TN 37 AB 1234", "TN 66 C 4521", "TN 38 BZ 7788"];

export function findBike(slug?: string | null): Bike | undefined {
  return slug ? bikes.find((b) => b.slug === slug) : undefined;
}

export function findColor(bike: Bike | undefined, colorName?: string | null): BikeColor | undefined {
  if (!bike) return undefined;
  const n = colorName?.toLowerCase().trim();
  return bike.colors.find((c) => c.name.toLowerCase() === n) ?? bike.colors[0];
}

/** "Mon – Sat · 8:30 AM – 6:30 PM" lines for the workshop. */
export function workshopHours() {
  return dealership.hours.workshop.map((h) => ({ days: h.days, time: `${formatSlot(h.open)} – ${formatSlot(h.close)}` }));
}

export function durationLabel(hours: number) {
  if (hours >= 24) return "1 day or more";
  if (hours <= 1) return "About 1 hr";
  return `About ${hours} hrs`;
}

export function serviceNames(ids: string[]) {
  return ids.map((id) => serviceTypes.find((s) => s.id === id)?.name ?? id);
}

/** Planned minutes for a set of services (capped to a workshop day for calendars). */
export function plannedMinutes(ids: string[]) {
  const hours = ids.reduce((sum, id) => sum + (serviceTypes.find((s) => s.id === id)?.durationHours ?? 1), 0);
  return Math.min(Math.max(hours, 1), 8) * 60;
}

export function stageIndex(stage: ServiceStage) {
  return serviceStages.findIndex((s) => s.id === stage);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole days from today until `iso` (negative when in the past). */
export function daysUntil(iso: string, now = new Date()) {
  const target = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Math.round((startOfDay(target) - startOfDay(now)) / 86_400_000);
}

export function relativeDays(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${-days} days ago`;
}

/** "Today, 4:30 PM" / "Tomorrow, 9:00 AM" / "12 Oct, 4:30 PM" */
export function friendlyDateTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const days = daysUntil(iso, now);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  if (days === -1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}
