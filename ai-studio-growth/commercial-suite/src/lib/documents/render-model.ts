import { calculateTotals, type TaxMode } from "../tax";
import { dec } from "../money";
import type { ProposalSectionData } from "../proposal/sections";
import { SECTION_META } from "../proposal/sections";
import type { DocumentStatus, DocumentTemplate, DocumentType } from "./meta";

export interface LineDetails {
  detailedDescription?: string;
  inclusions?: string[];
  exclusions?: string[];
  benefits?: string[];
  treatment?: string;
  badge?: string;
  metricValue?: string;
  metricLabel?: string;
  metricUnit?: string;
  metricNote?: string;
}

export interface RenderLine {
  name: string;
  description?: string | null;
  details?: LineDetails | null;
  hsnSac?: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: string;
  taxRate: string;
  billingFrequency?: string | null;
  grossAmount: string;
  discountAmount: string;
  taxableAmount: string;
  cgst: string;
  sgst: string;
  igst: string;
  taxAmount: string;
  totalAmount: string;
}

export interface RenderCompany {
  brandName: string;
  coBrandName?: string | null;
  tagline?: string | null;
  legalName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  gstin?: string | null;
  pan?: string | null;
  state?: string | null;
  stateCode?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
  upiId?: string | null;
  paymentInstructions?: string | null;
  authorisedSignatory?: string | null;
  documentFooter?: string | null;
  primaryColor: string;
  accentColor: string;
  logoPrimary?: string | null; // data URI
  logoSecondary?: string | null;
  logoPrimaryTile: "light" | "dark";
  logoSecondaryTile: "light" | "dark";
  currency: string;
}

export interface RenderCustomer {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  gstin?: string | null;
  state?: string | null;
  stateCode?: string | null;
}

export interface RenderTotals {
  subtotal: string;
  discountTotal: string;
  taxableTotal: string;
  cgstTotal: string;
  sgstTotal: string;
  igstTotal: string;
  taxTotal: string;
  roundOff: string;
  grandTotal: string;
  amountPaid: string;
  balance: string;
  taxBreakdown: { rate: string; taxable: string; cgst: string; sgst: string; igst: string; tax: string }[];
}

export interface RenderableDocument {
  id: string;
  type: DocumentType;
  number?: string | null;
  status: DocumentStatus;
  template: DocumentTemplate;
  title?: string | null;
  reference?: string | null;
  issueDate: string;
  validUntil?: string | null;
  dueDate?: string | null;
  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  taxMode: TaxMode;
  notes?: string | null;
  terms?: string | null;
  paymentTerms?: string | null;
  company: RenderCompany;
  customer: RenderCustomer;
  lines: RenderLine[];
  totals: RenderTotals;
  sections: ProposalSectionData[];
  preparedBy?: string | null;
  isSample?: boolean;
  isPreview?: boolean;
}

export interface LineSource {
  name: string;
  description?: string | null;
  details?: LineDetails | null;
  hsnSac?: string | null;
  quantity: string;
  unit: string;
  unitPrice: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: string;
  taxRate: string;
  billingFrequency?: string | null;
}

/**
 * Builds lines + totals from raw line inputs. Used by both the server loader and the
 * editor's live preview so both always agree. Invalid lines (while typing) are skipped in preview.
 */
export function buildLinesAndTotals(
  sources: LineSource[],
  taxMode: TaxMode,
  rounding: "NONE" | "NEAREST_RUPEE",
  amountPaid = "0",
): { lines: RenderLine[]; totals: RenderTotals } {
  const valid = sources.filter((s) => {
    try {
      calculateTotals([{ ...s, discountValue: s.discountValue || "0" }], taxMode);
      return true;
    } catch {
      return false;
    }
  });
  const t = calculateTotals(valid.map((s) => ({ ...s, discountValue: s.discountValue || "0" })), taxMode, rounding);
  const lines = valid.map((s, i) => {
    const r = t.lines[i];
    return {
      ...s,
      discountValue: s.discountValue || "0",
      grossAmount: r.gross.toFixed(2),
      discountAmount: r.discount.toFixed(2),
      taxableAmount: r.taxable.toFixed(2),
      cgst: r.cgst.toFixed(2),
      sgst: r.sgst.toFixed(2),
      igst: r.igst.toFixed(2),
      taxAmount: r.tax.toFixed(2),
      totalAmount: r.total.toFixed(2),
    };
  });
  return {
    lines,
    totals: {
      subtotal: t.subtotal.toFixed(2),
      discountTotal: t.discountTotal.toFixed(2),
      taxableTotal: t.taxableTotal.toFixed(2),
      cgstTotal: t.cgstTotal.toFixed(2),
      sgstTotal: t.sgstTotal.toFixed(2),
      igstTotal: t.igstTotal.toFixed(2),
      taxTotal: t.taxTotal.toFixed(2),
      roundOff: t.roundOff.toFixed(2),
      grandTotal: t.grandTotal.toFixed(2),
      amountPaid: dec(amountPaid).toFixed(2),
      balance: t.grandTotal.minus(dec(amountPaid)).toFixed(2),
      taxBreakdown: t.taxBreakdown.map((b) => ({
        rate: b.rate.toString(),
        taxable: b.taxable.toFixed(2),
        cgst: b.cgst.toFixed(2),
        sgst: b.sgst.toFixed(2),
        igst: b.igst.toFixed(2),
        tax: b.tax.toFixed(2),
      })),
    },
  };
}

// ───────── Page parts (for PDF assembly) ─────────

export type PageFormat = "slide" | "a4";

export interface RenderPart {
  kind: "full" | "flow";
  /** Indexes into the enabled section list (proposals only). */
  sectionIndexes: number[];
}

export function pageFormatFor(doc: Pick<RenderableDocument, "type" | "template">): PageFormat {
  return doc.type === "PROPOSAL" && doc.template === "PREMIUM_COMMERCIAL" ? "slide" : "a4";
}

export function enabledSections(doc: Pick<RenderableDocument, "sections">) {
  return doc.sections.filter((s) => s.enabled);
}

/**
 * Splits a document into parts: full-bleed single pages (cover, closing) and flowing content.
 * Each part is rendered to PDF separately and merged, so full-bleed pages carry no running
 * header/footer while flowing pages get consistent footers and correct page numbers.
 */
export function renderParts(doc: Pick<RenderableDocument, "type" | "template" | "sections">): RenderPart[] {
  if (doc.type !== "PROPOSAL") return [{ kind: "flow", sectionIndexes: [] }];
  const sections = enabledSections(doc);
  const parts: RenderPart[] = [];
  sections.forEach((s, i) => {
    if (SECTION_META[s.type].fullPage) parts.push({ kind: "full", sectionIndexes: [i] });
    else {
      const last = parts[parts.length - 1];
      if (last && last.kind === "flow") last.sectionIndexes.push(i);
      else parts.push({ kind: "flow", sectionIndexes: [i] });
    }
  });
  return parts.length ? parts : [{ kind: "flow", sectionIndexes: [] }];
}

export function brandLine(company: Pick<RenderCompany, "brandName" | "coBrandName">): string {
  return company.coBrandName ? `${company.brandName} × ${company.coBrandName}` : company.brandName;
}
