import { z } from "zod";
import { validateLine } from "../tax";
import { SECTION_ORDER } from "../proposal/sections";

const optionalText = (max = 2000) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).optional().or(z.literal("")).transform((v) => (v ? v : undefined));

export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");
const optionalIsoDate = isoDate.optional().or(z.literal("")).transform((v) => (v ? v : undefined));

export const gstinField = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || GSTIN_REGEX.test(v), "GSTIN must be 15 characters, e.g. 29ABCDE1234F1Z5");

export const stateCodeField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^\d{2}$/.test(v), "State code must be 2 digits, e.g. 29");

const emailField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v.toLowerCase() : undefined))
  .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^\+?[0-9 ()-]{7,20}$/.test(v), "Enter a valid phone number, e.g. +91 98765 43210");

// ───────── Customers ─────────
export const customerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required").max(200),
  contactPerson: optionalText(200),
  email: emailField,
  phone: phoneField,
  billingAddress: optionalText(1000),
  shippingAddress: optionalText(1000),
  gstin: gstinField,
  state: optionalText(100),
  stateCode: stateCodeField,
  notes: optionalText(4000),
  preferredChannel: z.enum(["EMAIL", "WHATSAPP", "PHONE"]),
  whatsappConsent: z.boolean().default(false),
});
export type CustomerInput = z.input<typeof customerSchema>;

// ───────── Catalogue ─────────
const decimalString = (label: string, opts: { min?: number; max?: number; allowZero?: boolean } = {}) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => /^-?\d+(\.\d+)?$/.test(v), `${label} must be a number`)
    .refine((v) => opts.min === undefined || Number(v) >= opts.min, `${label} cannot be less than ${opts.min}`)
    .refine((v) => opts.max === undefined || Number(v) <= opts.max, `${label} cannot exceed ${opts.max}`)
    .refine((v) => opts.allowZero !== false || Number(v) > 0, `${label} must be greater than zero`);

const stringList = z.array(z.string().trim().max(300)).max(50).transform((a) => a.filter(Boolean));

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(200),
  shortDescription: optionalText(300),
  detailedDescription: optionalText(5000),
  category: z.string().trim().min(2, "Category is required").max(100),
  sku: optionalText(60),
  hsnSac: optionalText(20),
  unit: z.string().trim().min(1, "Unit is required").max(30),
  defaultQuantity: decimalString("Default quantity", { min: 0, allowZero: false }),
  defaultPrice: decimalString("Default price", { min: 0 }),
  taxRate: decimalString("Tax rate", { min: 0, max: 100 }),
  billingFrequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL"]),
  inclusions: stringList,
  exclusions: stringList,
  active: z.boolean(),
});
export type ProductInput = z.input<typeof productSchema>;

// ───────── Documents ─────────
export const lineItemDetailsSchema = z
  .object({
    detailedDescription: optionalText(5000),
    inclusions: stringList.optional(),
    exclusions: stringList.optional(),
    benefits: stringList.optional(),
    treatment: optionalText(120),
    badge: optionalText(40),
    metricValue: optionalText(30),
    metricLabel: optionalText(60),
    metricUnit: optionalText(60),
    metricNote: optionalText(200),
  })
  .partial();

export const lineItemSchema = z
  .object({
    productServiceId: z.string().optional().nullable(),
    name: z.string().trim().min(1, "Item name is required").max(200),
    description: optionalText(2000),
    hsnSac: optionalText(20),
    quantity: z.string().trim(),
    unit: z.string().trim().min(1, "Unit is required").max(30),
    unitPrice: z.string().trim(),
    discountType: z.enum(["PERCENT", "AMOUNT"]),
    discountValue: z.string().trim(),
    taxRate: z.string().trim(),
    billingFrequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL"]).optional().nullable(),
    details: lineItemDetailsSchema.optional(),
  })
  .superRefine((line, ctx) => {
    const fieldFor = (msg: string) =>
      msg.startsWith("Quantity") ? "quantity" : msg.startsWith("Unit price") ? "unitPrice" : msg.startsWith("Tax") ? "taxRate" : "discountValue";
    for (const message of validateLine({ ...line, discountValue: line.discountValue || "0" })) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [fieldFor(message)] });
    }
  });
export type LineItemInput = z.input<typeof lineItemSchema>;

export const sectionItemSchema = z.object({
  title: z.string().trim().max(300),
  detail: z.string().trim().max(3000).optional(),
  tag: z.string().trim().max(60).optional(),
});

export const sectionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(SECTION_ORDER as [string, ...string[]]),
  title: z.string().trim().min(1, "Section title is required").max(200),
  enabled: z.boolean(),
  content: z.object({
    eyebrow: z.string().trim().max(80).optional(),
    body: z.string().max(10000).optional(),
    highlightLabel: z.string().trim().max(80).optional(),
    highlight: z.string().max(2000).optional(),
    itemsLabel: z.string().trim().max(80).optional(),
    items: z.array(sectionItemSchema).max(40).optional(),
    secondaryLabel: z.string().trim().max(120).optional(),
    secondaryItems: z.array(sectionItemSchema).max(40).optional(),
    note: z.string().max(2000).optional(),
  }),
});

export const documentSchema = z
  .object({
    type: z.enum(["PROPOSAL", "QUOTATION", "INVOICE", "PROFORMA"]),
    companyId: z.string().min(1, "Choose a company profile"),
    customerId: z.string().min(1, "Choose a customer"),
    template: z.enum(["PREMIUM_COMMERCIAL", "PROFESSIONAL_QUOTATION", "PROFESSIONAL_INVOICE", "DETAILED_PROPOSAL"]),
    title: optionalText(200),
    reference: optionalText(100),
    issueDate: isoDate,
    validUntil: optionalIsoDate,
    dueDate: optionalIsoDate,
    placeOfSupply: optionalText(100),
    placeOfSupplyCode: stateCodeField,
    taxMode: z.enum(["INTRA_STATE", "INTER_STATE", "NO_TAX"]),
    notes: optionalText(5000),
    terms: optionalText(10000),
    paymentTerms: optionalText(2000),
    lineItems: z.array(lineItemSchema).max(200),
    sections: z.array(sectionSchema).max(60).default([]),
  })
  .superRefine((doc, ctx) => {
    if (doc.validUntil && doc.validUntil < doc.issueDate)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["validUntil"], message: "Validity date cannot be before the issue date" });
    if (doc.dueDate && doc.dueDate < doc.issueDate)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dueDate"], message: "Due date cannot be before the issue date" });
  });
export type DocumentInput = z.input<typeof documentSchema>;
export type DocumentParsed = z.output<typeof documentSchema>;

// ───────── Payments ─────────
export const paymentSchema = z.object({
  documentId: z.string().min(1),
  paymentDate: isoDate,
  amount: decimalString("Amount", { min: 0, allowZero: false }).refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use at most 2 decimal places"),
  method: z.enum(["BANK_TRANSFER", "UPI", "CHEQUE", "CASH", "CARD", "OTHER"]),
  reference: optionalText(100),
  notes: optionalText(1000),
});
export type PaymentInput = z.input<typeof paymentSchema>;

// ───────── Company ─────────
export const companySchema = z.object({
  brandName: z.string().trim().min(2, "Brand name is required").max(120),
  coBrandName: optionalText(120),
  tagline: optionalText(200),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour, e.g. #0F1B3D"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour, e.g. #6D28D9"),
  logoPrimaryTile: z.enum(["light", "dark"]),
  logoSecondaryTile: z.enum(["light", "dark"]),
  legalName: optionalText(200),
  address: optionalText(1000),
  phone: phoneField,
  email: emailField,
  website: optionalText(200),
  gstin: gstinField,
  pan: z.string().trim().toUpperCase().optional().or(z.literal("")).transform((v) => (v ? v : undefined)).refine((v) => !v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v), "PAN must look like ABCDE1234F"),
  state: optionalText(100),
  stateCode: stateCodeField,
  bankName: optionalText(120),
  bankAccountName: optionalText(120),
  bankAccountNumber: optionalText(40),
  bankIfsc: z.string().trim().toUpperCase().optional().or(z.literal("")).transform((v) => (v ? v : undefined)).refine((v) => !v || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v), "IFSC must look like HDFC0001234"),
  bankBranch: optionalText(120),
  upiId: optionalText(100),
  paymentInstructions: optionalText(2000),
  authorisedSignatory: optionalText(120),
  documentFooter: optionalText(500),
  termsQuotation: optionalText(10000),
  termsInvoice: optionalText(10000),
  termsProposal: optionalText(10000),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AED"]),
  defaultTaxRate: decimalString("Default tax rate", { min: 0, max: 100 }),
  roundingMode: z.enum(["NONE", "NEAREST_RUPEE"]),
  isDefault: z.boolean(),
});
export type CompanyInput = z.input<typeof companySchema>;

export const sequenceSchema = z.object({
  prefix: z.string().trim().min(1, "Prefix is required").max(20).regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and hyphens only"),
  nextNumber: z.coerce.number().int().min(1).max(99999999),
  padding: z.coerce.number().int().min(1).max(10),
  includeFinancialYear: z.boolean(),
});

// ───────── Users ─────────
export const passwordField = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include letters and numbers");

export const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "STAFF"]),
  password: passwordField,
});

// ───────── Messaging ─────────
export const sendEmailSchema = z.object({
  documentId: z.string().min(1),
  to: z.string().trim().toLowerCase().email("Enter a valid recipient email"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Message is required").max(10000),
  messageType: z.enum(["DOCUMENT", "PAYMENT_REMINDER"]),
  attachPdf: z.boolean(),
});

export const sendWhatsAppSchema = z.object({
  documentId: z.string().min(1),
  to: z.string().trim().min(8, "Enter the recipient's WhatsApp number with country code"),
  message: z.string().trim().min(1).max(1024),
  messageType: z.enum(["DOCUMENT", "PAYMENT_REMINDER"]),
});
