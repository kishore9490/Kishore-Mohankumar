import { todayISO, toISODate } from "../dates";
import { dec } from "../money";

export type DocumentType = "PROPOSAL" | "QUOTATION" | "INVOICE" | "PROFORMA";
export type DocumentStatus =
  | "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED"
  | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type DocumentTemplate = "PREMIUM_COMMERCIAL" | "PROFESSIONAL_QUOTATION" | "PROFESSIONAL_INVOICE" | "DETAILED_PROPOSAL";

export const DOCUMENT_TYPES: DocumentType[] = ["PROPOSAL", "QUOTATION", "INVOICE", "PROFORMA"];

export const DOCUMENT_TYPE_META: Record<
  DocumentType,
  { label: string; plural: string; printTitle: string; slug: string; defaultPrefix: string; templates: DocumentTemplate[]; dateLabel: "validUntil" | "dueDate" }
> = {
  PROPOSAL: { label: "Commercial Proposal", plural: "Commercial Proposals", printTitle: "Commercial Proposal", slug: "proposals", defaultPrefix: "PRP", templates: ["PREMIUM_COMMERCIAL", "DETAILED_PROPOSAL"], dateLabel: "validUntil" },
  QUOTATION: { label: "Quotation", plural: "Quotations", printTitle: "Quotation", slug: "quotations", defaultPrefix: "QT", templates: ["PROFESSIONAL_QUOTATION", "PREMIUM_COMMERCIAL"], dateLabel: "validUntil" },
  INVOICE: { label: "Tax Invoice", plural: "Invoices", printTitle: "Tax Invoice", slug: "invoices", defaultPrefix: "INV", templates: ["PROFESSIONAL_INVOICE", "PREMIUM_COMMERCIAL"], dateLabel: "dueDate" },
  // A proforma invoice is never labelled as a tax invoice.
  PROFORMA: { label: "Proforma Invoice", plural: "Proforma Invoices", printTitle: "Proforma Invoice", slug: "proforma", defaultPrefix: "PI", templates: ["PROFESSIONAL_INVOICE", "PREMIUM_COMMERCIAL"], dateLabel: "dueDate" },
};

export function typeFromSlug(slug: string): DocumentType | null {
  return (Object.entries(DOCUMENT_TYPE_META).find(([, m]) => m.slug === slug)?.[0] as DocumentType) ?? null;
}

export const TEMPLATE_META: Record<DocumentTemplate, { label: string; description: string; format: string }> = {
  PREMIUM_COMMERCIAL: { label: "Premium Commercial", description: "Navy and purple premium style, inspired by the Anant Motors proposal.", format: "16:9 landscape for proposals · A4 for other documents" },
  PROFESSIONAL_QUOTATION: { label: "Professional Quotation", description: "Clean, compact business quotation layout.", format: "A4 portrait" },
  PROFESSIONAL_INVOICE: { label: "Professional Invoice", description: "Clear, print-friendly invoice with GST breakdown.", format: "A4 portrait" },
  DETAILED_PROPOSAL: { label: "Detailed Project Proposal", description: "Structured, numbered multi-section proposal.", format: "A4 portrait" },
};

export const STATUS_META: Record<DocumentStatus, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" | "purple" }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SENT: { label: "Sent", tone: "info" },
  ACCEPTED: { label: "Accepted", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  EXPIRED: { label: "Expired", tone: "warning" },
  ISSUED: { label: "Issued", tone: "purple" },
  PARTIALLY_PAID: { label: "Partially paid", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  OVERDUE: { label: "Overdue", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

/** Statuses a user may choose manually per type (stored statuses). */
export const STORED_STATUSES: Record<DocumentType, DocumentStatus[]> = {
  PROPOSAL: ["DRAFT", "SENT", "ACCEPTED", "REJECTED"],
  QUOTATION: ["DRAFT", "SENT", "ACCEPTED", "REJECTED"],
  INVOICE: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "CANCELLED"],
  PROFORMA: ["DRAFT", "SENT", "CANCELLED"],
};

/** Statuses shown in list filters (includes computed EXPIRED / OVERDUE). */
export const FILTER_STATUSES: Record<DocumentType, DocumentStatus[]> = {
  PROPOSAL: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
  QUOTATION: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"],
  INVOICE: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "OVERDUE", "PAID", "CANCELLED"],
  PROFORMA: ["DRAFT", "SENT", "CANCELLED"],
};

interface StatusInput {
  type: DocumentType;
  status: DocumentStatus;
  validUntil?: Date | string | null;
  dueDate?: Date | string | null;
  grandTotal?: unknown;
  amountPaid?: unknown;
}

/**
 * Effective status combines the stored status with dates:
 *  - Quotations/proposals/proformas past their validity (and not accepted/rejected/cancelled) are EXPIRED.
 *  - Issued or partially paid invoices past their due date with a balance outstanding are OVERDUE.
 * Invoices are never marked paid automatically; PAID is only reached through recorded payments.
 */
export function effectiveStatus(doc: StatusInput, today = todayISO()): DocumentStatus {
  if (doc.type === "INVOICE") {
    if ((doc.status === "ISSUED" || doc.status === "PARTIALLY_PAID") && doc.dueDate) {
      const balance = dec(doc.grandTotal as string).minus(dec(doc.amountPaid as string));
      if (toISODate(doc.dueDate) < today && balance.gt(0)) return "OVERDUE";
    }
    return doc.status;
  }
  if ((doc.status === "DRAFT" || doc.status === "SENT") && doc.validUntil && toISODate(doc.validUntil) < today) return "EXPIRED";
  return doc.status;
}

export function balanceDue(doc: { grandTotal: unknown; amountPaid: unknown }) {
  return dec(doc.grandTotal as string).minus(dec(doc.amountPaid as string));
}

/** Which conversions are allowed from a source document. */
export function allowedConversions(type: DocumentType): DocumentType[] {
  if (type === "QUOTATION" || type === "PROPOSAL") return ["INVOICE", "PROFORMA"];
  if (type === "PROFORMA") return ["INVOICE"];
  return [];
}

export function isEditable(doc: { type: DocumentType; status: DocumentStatus }): boolean {
  if (doc.type === "INVOICE") return doc.status === "DRAFT";
  return doc.status === "DRAFT" || doc.status === "SENT";
}

export const BILLING_FREQUENCY_LABEL: Record<string, string> = {
  ONE_TIME: "One-time",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half-yearly",
  ANNUAL: "Annual",
};

export const BILLING_FREQUENCY_SUFFIX: Record<string, string> = {
  ONE_TIME: "",
  MONTHLY: " / Month",
  QUARTERLY: " / Quarter",
  HALF_YEARLY: " / Half-year",
  ANNUAL: " / Year",
};

export const TAX_MODE_LABEL: Record<string, string> = {
  INTRA_STATE: "Intra-state (CGST + SGST)",
  INTER_STATE: "Inter-state (IGST)",
  NO_TAX: "No tax applied",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer",
  UPI: "UPI",
  CHEQUE: "Cheque",
  CASH: "Cash",
  CARD: "Card",
  OTHER: "Other",
};
