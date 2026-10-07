import { NextResponse } from "next/server";
import type { Lead, LeadType } from "@/lib/types";

const TYPES: LeadType[] = ["demo", "counselling", "enquiry", "contact", "quiz"];
const clip = (v: unknown, n = 500) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);

/**
 * Lead intake. Validates input and forwards it to LEADS_WEBHOOK_URL (CRM, Zapier,
 * Make, Google Apps Script, ...) when configured. No database is bundled on purpose.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lead: Lead = {
    type: TYPES.includes(body.type as LeadType) ? (body.type as LeadType) : "enquiry",
    name: clip(body.name, 120) ?? "",
    phone: clip(body.phone, 30) ?? "",
    email: clip(body.email, 160),
    education: clip(body.education, 120),
    experience: clip(body.experience, 200),
    interest: clip(body.interest, 200),
    preferredContact: ["phone", "whatsapp", "email"].includes(body.preferredContact as string)
      ? (body.preferredContact as Lead["preferredContact"])
      : undefined,
    preferredSlot: clip(body.preferredSlot, 120),
    message: clip(body.message, 2000),
    programSlug: clip(body.programSlug, 120),
    source: clip(body.source, 200),
    consent: body.consent === true,
  };

  if (lead.name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 422 });
  if (lead.phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 422 });
  if (!lead.consent) return NextResponse.json({ error: "Please allow us to contact you." }, { status: 422 });

  const hook = process.env.LEADS_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error(String(r.status));
    } catch (e) {
      console.error("[leads] webhook failed", e);
      return NextResponse.json({ error: "We couldn't submit right now. Please try again shortly." }, { status: 502 });
    }
  } else {
    console.info("[leads] received (no LEADS_WEBHOOK_URL configured)", { type: lead.type, source: lead.source });
  }

  return NextResponse.json({ ok: true });
}
