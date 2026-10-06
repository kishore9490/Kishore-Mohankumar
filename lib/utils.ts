export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
