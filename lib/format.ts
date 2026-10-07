import { twMerge } from "tailwind-merge";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** ₹1,24,500 */
export const formatINR = (value: number) => inr.format(Math.round(value));
/** 1,24,500 */
export const formatNumber = (value: number) => num.format(value);
/** ₹1.24 lakh */
export function formatLakh(value: number) {
  if (value < 1_00_000) return formatINR(value);
  return `₹${(value / 1_00_000).toFixed(2).replace(/\.?0+$/, "")} lakh`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("en-IN", opts);
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** "14:30" → "2:30 PM" */
export function formatSlot(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "+919876543210" → "+91 98765 43210" */
export function formatPhone(e164: string) {
  const d = e164.replace(/\D/g, "");
  const local = d.slice(-10);
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

/** Normalises "tn 37 ab 1234" → "TN37AB1234" */
export const normaliseRegistration = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** "TN37AB1234" → "TN 37 AB 1234" */
export function formatRegistration(v: string) {
  const m = normaliseRegistration(v).match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
  if (!m) return v.toUpperCase();
  return [m[1], m[2], m[3], m[4]].filter(Boolean).join(" ");
}

/** Class joiner with Tailwind conflict resolution (later classes win). */
export const cn = (...classes: (string | false | null | undefined)[]) => twMerge(classes.filter(Boolean).join(" "));
