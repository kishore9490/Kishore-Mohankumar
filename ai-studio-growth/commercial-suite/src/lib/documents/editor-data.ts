import "server-only";
import { prisma } from "../prisma";
import { toRenderCompany } from "./load";
import { addDaysISO, todayISO, toISODate } from "../dates";
import { DOCUMENT_TYPE_META, type DocumentType } from "./meta";
import { suggestTaxMode } from "../tax";
import type { DocumentInput } from "../validation/schemas";
import type { EditorCompany, EditorCustomer, EditorProduct } from "@/components/editor/types";
import type { SectionContent } from "../proposal/sections";

export async function loadEditorData(includeCustomerId?: string) {
  const [companies, customers, products] = await Promise.all([
    prisma.companyProfile.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    prisma.customer.findMany({ where: { OR: [{ archived: false }, ...(includeCustomerId ? [{ id: includeCustomerId }] : [])] }, orderBy: { name: "asc" } }),
    prisma.productService.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { name: "asc" }] }),
  ]);
  const editorCompanies: EditorCompany[] = companies.map((c) => ({
    ...toRenderCompany(c),
    id: c.id,
    roundingMode: c.roundingMode,
    defaultTaxRate: c.defaultTaxRate.toString(),
    termsQuotation: c.termsQuotation,
    termsInvoice: c.termsInvoice,
    termsProposal: c.termsProposal,
    isDefault: c.isDefault,
  }));
  const editorCustomers: EditorCustomer[] = customers.map((c) => ({
    id: c.id, name: c.name, contactPerson: c.contactPerson, email: c.email, phone: c.phone, billingAddress: c.billingAddress,
    shippingAddress: c.shippingAddress, gstin: c.gstin, state: c.state, stateCode: c.stateCode,
  }));
  const editorProducts: EditorProduct[] = products.map((p) => ({
    id: p.id, name: p.name, category: p.category, shortDescription: p.shortDescription, detailedDescription: p.detailedDescription, hsnSac: p.hsnSac,
    unit: p.unit, defaultQuantity: p.defaultQuantity.toString(), defaultPrice: p.defaultPrice.toString(), taxRate: p.taxRate.toString(),
    billingFrequency: p.billingFrequency, inclusions: p.inclusions, exclusions: p.exclusions,
  }));
  return { companies: editorCompanies, customers: editorCustomers, products: editorProducts };
}

export function newDocumentDefaults(type: DocumentType, company: EditorCompany | undefined, customer?: EditorCustomer): DocumentInput {
  const today = todayISO();
  const terms = type === "QUOTATION" ? company?.termsQuotation : type === "PROPOSAL" ? company?.termsProposal : company?.termsInvoice;
  return {
    type,
    companyId: company?.id ?? "",
    customerId: customer?.id ?? "",
    template: DOCUMENT_TYPE_META[type].templates[0],
    title: "",
    reference: "",
    issueDate: today,
    validUntil: type === "QUOTATION" ? addDaysISO(today, 15) : type === "PROPOSAL" ? addDaysISO(today, 7) : "",
    dueDate: type === "INVOICE" ? addDaysISO(today, 15) : type === "PROFORMA" ? addDaysISO(today, 7) : "",
    placeOfSupply: customer?.state ?? "",
    placeOfSupplyCode: customer?.stateCode ?? "",
    taxMode: suggestTaxMode(company?.stateCode, customer?.stateCode),
    notes: "",
    terms: terms ?? "",
    paymentTerms: "",
    lineItems: [],
    sections: [],
  };
}

export async function documentToInput(id: string): Promise<{ input: DocumentInput; number: string | null; type: DocumentType; status: string; customerId: string } | null> {
  const d = await prisma.document.findUnique({ where: { id }, include: { lineItems: { orderBy: { position: "asc" } }, sections: { orderBy: { position: "asc" } } } });
  if (!d) return null;
  return {
    number: d.number,
    type: d.type as DocumentType,
    status: d.status,
    customerId: d.customerId,
    input: {
      type: d.type,
      companyId: d.companyId,
      customerId: d.customerId,
      template: d.template,
      title: d.title ?? "",
      reference: d.reference ?? "",
      issueDate: toISODate(d.issueDate),
      validUntil: d.validUntil ? toISODate(d.validUntil) : "",
      dueDate: d.dueDate ? toISODate(d.dueDate) : "",
      placeOfSupply: d.placeOfSupply ?? "",
      placeOfSupplyCode: d.placeOfSupplyCode ?? "",
      taxMode: d.taxMode,
      notes: d.notes ?? "",
      terms: d.terms ?? "",
      paymentTerms: d.paymentTerms ?? "",
      lineItems: d.lineItems.map((l) => ({
        productServiceId: l.productServiceId,
        name: l.name,
        description: l.description ?? "",
        hsnSac: l.hsnSac ?? "",
        quantity: l.quantity.toString(),
        unit: l.unit,
        unitPrice: l.unitPrice.toString(),
        discountType: l.discountType,
        discountValue: l.discountValue.toString(),
        taxRate: l.taxRate.toString(),
        billingFrequency: l.billingFrequency,
        details: (l.details as DocumentInput["lineItems"][number]["details"]) ?? {},
      })),
      sections: d.sections.map((s) => ({ id: s.id, type: s.type, title: s.title, enabled: s.enabled, content: s.content as SectionContent })),
    },
  };
}
