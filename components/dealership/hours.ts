import type { OpeningHours } from "@/lib/types";

/**
 * Opening-hours maths, always evaluated in India Standard Time (UTC+5:30)
 * regardless of the visitor's device timezone.
 */
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const IST_OFFSET_MIN = 330;

function dayIndex(token: string) {
  return DAY_KEYS.indexOf(token.trim().slice(0, 3).toLowerCase());
}

/** "Mon – Sat" → [1..6], "Sunday" → [0], "Mon, Wed" → [1, 3]. */
export function parseDays(days: string): number[] {
  const out = new Set<number>();
  for (const part of days.split(",")) {
    const [a, b] = part.split(/[–—-]/);
    const start = dayIndex(a ?? "");
    if (start < 0) continue;
    const end = b ? dayIndex(b) : start;
    if (end < 0) continue;
    for (let d = start; ; d = (d + 1) % 7) {
      out.add(d);
      if (d === end) break;
    }
  }
  return [...out];
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** "20:00" → "8 PM", "09:30" → "9:30 AM" */
export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return m ? `${hr}:${String(m).padStart(2, "0")} ${suffix}` : `${hr} ${suffix}`;
}

export function formatRange(h: OpeningHours) {
  return `${formatClock(h.open)} – ${formatClock(h.close)}`;
}

export interface HoursStatus {
  open: boolean;
  /** Closing within the hour. */
  closingSoon: boolean;
  headline: string;
  detail: string;
}

function hoursFor(hours: OpeningHours[], day: number) {
  return hours.find((h) => parseDays(h.days).includes(day));
}

export function getHoursStatus(hours: OpeningHours[], now: Date): HoursStatus {
  const ist = new Date(now.getTime() + IST_OFFSET_MIN * 60_000);
  const day = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const today = hoursFor(hours, day);

  if (today && mins >= toMin(today.open) && mins < toMin(today.close)) {
    const left = toMin(today.close) - mins;
    return { open: true, closingSoon: left <= 60, headline: left <= 60 ? "Closing soon" : "Open now", detail: `Closes at ${formatClock(today.close)}` };
  }
  if (today && mins < toMin(today.open)) {
    return { open: false, closingSoon: false, headline: "Closed now", detail: `Opens at ${formatClock(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = hoursFor(hours, d);
    if (next) {
      const when = i === 1 ? "tomorrow" : DAY_SHORT[d];
      return { open: false, closingSoon: false, headline: "Closed now", detail: `Opens ${when} at ${formatClock(next.open)}` };
    }
  }
  return { open: false, closingSoon: false, headline: "Closed", detail: "Call us for timings" };
}
