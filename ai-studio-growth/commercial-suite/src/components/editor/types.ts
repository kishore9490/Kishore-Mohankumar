import type { RenderCompany } from "@/lib/documents/render-model";

export interface EditorCompany extends RenderCompany {
  id: string;
  roundingMode: "NONE" | "NEAREST_RUPEE";
  defaultTaxRate: string;
  termsQuotation?: string | null;
  termsInvoice?: string | null;
  termsProposal?: string | null;
  isDefault: boolean;
}

export interface EditorCustomer {
  id: string;
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

export interface EditorProduct {
  id: string;
  name: string;
  category: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  hsnSac?: string | null;
  unit: string;
  defaultQuantity: string;
  defaultPrice: string;
  taxRate: string;
  billingFrequency: string;
  inclusions: string[];
  exclusions: string[];
}
