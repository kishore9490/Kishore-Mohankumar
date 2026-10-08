const tz = "Asia/Kolkata";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: tz });
}
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: tz });
}
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: tz });
}
export function formatDateTime(iso: string) {
  return `${formatShortDate(iso)}, ${formatTime(iso)}`;
}
export function formatWeekday(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: tz });
}
export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
export function relative(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const h = Math.round(abs / 3600000);
  const d = Math.round(abs / 86400000);
  const s = m < 60 ? `${m} min` : h < 24 ? `${h} h` : `${d} day${d === 1 ? "" : "s"}`;
  return diff >= 0 ? `in ${s}` : `${s} ago`;
}
export function greeting(date = new Date()) {
  const h = Number(date.toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: tz }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
