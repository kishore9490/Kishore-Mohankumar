import "server-only";
import { db, newId } from "@/server/db/store";
import { emit } from "@/server/events/bus";
import { permissionsFor } from "@/lib/platform/rbac";
import { programs } from "@/data/programs";
import type { Lead as WebsiteLead } from "@/lib/types";
import type { Lead } from "@/lib/platform/types";
import { audit } from "./audit";

const digits = (s: string) => s.replace(/\D/g, "");

/** Users who should hear about new enquiries (anyone who can view leads). */
export function growthTeamIds() {
  return db().users.filter((u) => u.status === "active" && permissionsFor(u.role, u.extraPermissions).includes("leads.view")).map((u) => u.id);
}

/**
 * Website → CRM. A demo booking, counselling request or enquiry from the public site
 * becomes (or updates) a lead in the Growth Center and notifies the growth team.
 */
export async function captureWebsiteLead(input: WebsiteLead) {
  const d = db();
  const phone = digits(input.phone).slice(-10);
  const program = programs.find((p) => p.slug === input.programSlug)?.name ?? null;
  const kind = input.type === "demo" ? "Demo class requested" : input.type === "counselling" ? "Counselling requested" : "Website enquiry";
  const detail = [input.education, input.preferredSlot, input.preferredContact && `prefers ${input.preferredContact}`, input.message].filter(Boolean).join(" · ");

  let lead = d.leads.find((l) => digits(l.phone).endsWith(phone));
  const isNew = !lead;
  if (!lead) {
    lead = {
      id: newId("lead"),
      name: input.name,
      phone: `+91 ${phone}`,
      email: input.email ?? null,
      programInterest: program ?? programs[0]?.name ?? null,
      education: input.education ?? null,
      source: "website",
      campaignId: null,
      status: "new",
      assignedTo: null,
      lastContactAt: null,
      nextFollowUpAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
      createdAt: new Date().toISOString(),
      // Consent on the website form covers phone/WhatsApp/email contact about this request.
      whatsappOptIn: input.consent,
      lostReason: null,
    } satisfies Lead;
    d.leads.unshift(lead);
  } else if (input.email && !lead.email) {
    lead.email = input.email;
  }

  d.leadActivities.unshift({ id: newId("act"), leadId: lead.id, type: "form", summary: `${kind} on ${input.source || "the website"}${detail ? ` — ${detail.slice(0, 220)}` : ""}`, at: new Date().toISOString(), by: null });
  await audit({ user: null, action: isNew ? "lead.created" : "lead.updated", objectType: "Lead", objectId: lead.id, meta: { source: "website", form: input.type } });

  await emit("lead.created", {
    leadId: lead.id,
    userIds: growthTeamIds(),
    vars: { lead_name: lead.name, lead_source: input.type === "demo" ? "demo request" : input.type === "counselling" ? "counselling request" : "website", course_name: lead.programInterest ?? "a program" },
    href: `/academy/marketing/leads/${lead.id}`,
  });
  return lead;
}
