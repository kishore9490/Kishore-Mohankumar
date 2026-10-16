import { formatMoney } from "../money";
import { formatDate } from "../dates";
import { DOCUMENT_TYPE_META } from "../documents/meta";
import { brandLine, type RenderableDocument } from "../documents/render-model";

/** Replaces {{placeholders}}; unknown placeholders are left visible so mistakes are noticed. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

export function templateVars(doc: RenderableDocument, senderName: string): Record<string, string> {
  return {
    customerName: doc.customer.contactPerson && doc.customer.contactPerson !== "Sample contact" ? doc.customer.contactPerson : doc.customer.name,
    customerCompany: doc.customer.name,
    documentNumber: doc.number ?? "(draft)",
    documentTitle: doc.title ?? DOCUMENT_TYPE_META[doc.type].label,
    documentType: DOCUMENT_TYPE_META[doc.type].label,
    amount: formatMoney(doc.totals.grandTotal, doc.company.currency),
    balance: formatMoney(doc.totals.balance, doc.company.currency),
    dueDate: doc.dueDate ? formatDate(doc.dueDate) : "—",
    validUntil: doc.validUntil ? formatDate(doc.validUntil) : "—",
    companyName: brandLine(doc.company),
    senderName,
  };
}

export const TEMPLATE_PLACEHOLDERS = ["customerName", "customerCompany", "documentNumber", "documentTitle", "documentType", "amount", "balance", "dueDate", "validUntil", "companyName", "senderName"];

/** Delivery status ranking — webhook updates never move a message backwards. */
export const STATUS_RANK: Record<string, number> = { PREPARED: 0, QUEUED: 1, SENT_TO_PROVIDER: 2, SENT_MANUAL: 2, DELIVERED: 3, READ: 4, FAILED: 5 };

export function mapWhatsAppStatus(s: string): "SENT_TO_PROVIDER" | "DELIVERED" | "READ" | "FAILED" | null {
  switch (s) {
    case "sent":
      return "SENT_TO_PROVIDER";
    case "delivered":
      return "DELIVERED";
    case "read":
      return "READ";
    case "failed":
      return "FAILED";
    default:
      return null;
  }
}

export const DELIVERY_STATUS_META: Record<string, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" | "purple"; help: string }> = {
  PREPARED: { label: "Prepared", tone: "neutral", help: "Chat opened in WhatsApp Business (or development mock) — not yet confirmed as sent." },
  SENT_MANUAL: { label: "Sent (confirmed)", tone: "success", help: "Sent from the WhatsApp Business app and confirmed by a team member." },
  QUEUED: { label: "Queued", tone: "info", help: "Being submitted to the provider." },
  SENT_TO_PROVIDER: { label: "Sent to provider", tone: "purple", help: "The provider accepted the message. This does not prove the customer received it." },
  DELIVERED: { label: "Delivered", tone: "success", help: "The provider reported delivery to the recipient's device." },
  READ: { label: "Read / opened", tone: "success", help: "WhatsApp reported the message as read, or Brevo reported the email as opened." },
  FAILED: { label: "Failed", tone: "danger", help: "The provider rejected or failed to deliver the message." },
};
