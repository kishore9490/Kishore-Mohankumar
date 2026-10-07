import type { Lead } from "./types";

/** Client-side helper: posts a lead to the site's API route, which forwards it to a CRM if configured. */
export async function submitLead(lead: Lead): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, source: lead.source ?? (typeof window !== "undefined" ? window.location.pathname : "") }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export function validatePhone(v: string) {
  return v.replace(/[^\d]/g, "").length >= 10;
}
export function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
