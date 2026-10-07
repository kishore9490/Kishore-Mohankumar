import { site } from "@/data/site";

export type WhatsAppIntent = "courses" | "counsellor" | "demo" | "eligibility" | "info" | "program";

const messages: Record<WhatsAppIntent, string> = {
  courses: "Hi EMC, I'd like to know more about your medical coding courses.",
  counsellor: "Hi EMC, I'd like to talk to a counsellor about medical coding.",
  demo: "Hi EMC, I'd like to book a free demo class.",
  eligibility: "Hi EMC, could you tell me if I'm eligible for your medical coding program? My background is: ",
  info: "Hi EMC, please share course information (duration, mode and fees).",
  program: "Hi EMC, I'm interested in the {program}. Could you share details?",
};

export const whatsappEnabled = () => site.whatsapp.number.replace(/\D/g, "").length >= 8;

/** Returns a wa.me deep link, or null when no number is configured. */
export function whatsappLink(intent: WhatsAppIntent, vars: { program?: string } = {}) {
  if (!whatsappEnabled()) return null;
  const text = messages[intent].replace("{program}", vars.program ?? "program");
  return `https://wa.me/${site.whatsapp.number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export const whatsappIntents: { intent: WhatsAppIntent; label: string }[] = [
  { intent: "courses", label: "Ask about courses" },
  { intent: "counsellor", label: "Talk to a counsellor" },
  { intent: "demo", label: "Book a demo" },
  { intent: "eligibility", label: "Ask about eligibility" },
  { intent: "info", label: "Get course information" },
];
