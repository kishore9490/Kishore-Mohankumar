import { dealership } from "@/data/dealership";

export type WhatsAppIntent = "sales" | "service" | "bike" | "directions" | "accessories" | "general";

export function whatsappMessage(intent: WhatsAppIntent, context?: string) {
  switch (intent) {
    case "bike":
      return `Hi ${dealership.shortName}, I'm interested in the Honda ${context}. Could you share the on-road price and availability?`;
    case "sales":
      return `Hi ${dealership.shortName}, I'd like to talk to your sales team about a new Honda.`;
    case "service":
      return context
        ? `Hi ${dealership.shortName}, I have a service question about my bike (${context}).`
        : `Hi ${dealership.shortName}, I'd like to book a service for my Honda.`;
    case "directions":
      return `Hi ${dealership.shortName}, could you share directions to the showroom?`;
    case "accessories":
      return `Hi ${dealership.shortName}, I'd like to know more about these accessories${context ? `: ${context}` : ""}.`;
    default:
      return `Hi ${dealership.shortName}, I have a question.`;
  }
}

export function whatsappUrl(intent: WhatsAppIntent, context?: string) {
  return `https://wa.me/${dealership.whatsapp}?text=${encodeURIComponent(whatsappMessage(intent, context))}`;
}
