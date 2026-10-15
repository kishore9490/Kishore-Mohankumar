import "server-only";
import { prisma } from "../prisma";
import { toISODate } from "../dates";
import { buildLinesAndTotals, type LineDetails, type RenderableDocument, type RenderCompany } from "./render-model";
import { effectiveStatus, type DocumentStatus, type DocumentTemplate, type DocumentType } from "./meta";
import type { ProposalSectionData, SectionContent } from "../proposal/sections";
import type { CompanyProfile } from "@prisma/client";

function dataUri(bytes: Uint8Array | null, mime: string | null): string | null {
  if (!bytes || !mime) return null;
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}

export function toRenderCompany(c: CompanyProfile): RenderCompany {
  return {
    brandName: c.brandName,
    coBrandName: c.coBrandName,
    tagline: c.tagline,
    legalName: c.legalName,
    address: c.address,
    phone: c.phone,
    email: c.email,
    website: c.website,
    gstin: c.gstin,
    pan: c.pan,
    state: c.state,
    stateCode: c.stateCode,
    bankName: c.bankName,
    bankAccountName: c.bankAccountName,
    bankAccountNumber: c.bankAccountNumber,
    bankIfsc: c.bankIfsc,
    bankBranch: c.bankBranch,
    upiId: c.upiId,
    paymentInstructions: c.paymentInstructions,
    authorisedSignatory: c.authorisedSignatory,
    documentFooter: c.documentFooter,
    primaryColor: c.primaryColor,
    accentColor: c.accentColor,
    logoPrimary: dataUri(c.logoPrimary, c.logoPrimaryMime),
    logoSecondary: dataUri(c.logoSecondary, c.logoSecondaryMime),
    logoPrimaryTile: c.logoPrimaryTile === "dark" ? "dark" : "light",
    logoSecondaryTile: c.logoSecondaryTile === "light" ? "light" : "dark",
    currency: c.currency,
  };
}

/** Loads a document as a RenderableDocument. Line values are recomputed from stored inputs. */
export async function loadRenderableDocument(id: string): Promise<RenderableDocument | null> {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      company: true,
      lineItems: { orderBy: { position: "asc" } },
      sections: { orderBy: { position: "asc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!doc) return null;
  const { lines, totals } = buildLinesAndTotals(
    doc.lineItems.map((l) => ({
      name: l.name,
      description: l.description,
      details: (l.details as LineDetails | null) ?? null,
      hsnSac: l.hsnSac,
      quantity: l.quantity.toString(),
      unit: l.unit,
      unitPrice: l.unitPrice.toString(),
      discountType: l.discountType,
      discountValue: l.discountValue.toString(),
      taxRate: l.taxRate.toString(),
      billingFrequency: l.billingFrequency,
    })),
    doc.taxMode,
    doc.roundingMode,
    doc.amountPaid.toString(),
  );
  return {
    id: doc.id,
    type: doc.type as DocumentType,
    number: doc.number,
    status: effectiveStatus({ ...doc, type: doc.type as DocumentType, status: doc.status as DocumentStatus }),
    template: doc.template as DocumentTemplate,
    title: doc.title,
    reference: doc.reference,
    issueDate: toISODate(doc.issueDate),
    validUntil: doc.validUntil ? toISODate(doc.validUntil) : null,
    dueDate: doc.dueDate ? toISODate(doc.dueDate) : null,
    placeOfSupply: doc.placeOfSupply,
    placeOfSupplyCode: doc.placeOfSupplyCode,
    taxMode: doc.taxMode,
    notes: doc.notes,
    terms: doc.terms,
    paymentTerms: doc.paymentTerms,
    company: toRenderCompany(doc.company),
    customer: doc.customerSnapshot as unknown as RenderableDocument["customer"],
    lines,
    totals,
    sections: doc.sections.map((s) => ({ id: s.id, type: s.type, title: s.title, enabled: s.enabled, content: s.content as SectionContent }) as ProposalSectionData),
    preparedBy: doc.createdBy?.name ?? null,
    isSample: doc.isSample,
  };
}
