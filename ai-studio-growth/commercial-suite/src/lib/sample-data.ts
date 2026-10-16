/**
 * Base configuration + clearly-labelled SAMPLE data.
 * Sample records are flagged `isSample = true`, carry "Sample" labels, and render with a SAMPLE watermark.
 * They are illustrations only — not real issued transactions. The Anant Motors proposal content is
 * derived from the reference proposal supplied for design purposes.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { inviteUser } from "./auth/accounts";
import { addDaysISO, todayISO } from "./dates";
import { documentSchema, type DocumentInput } from "./validation/schemas";
import { issueInvoice, recordPayment, saveDocument, setDocumentStatus } from "./services/documents";
import { defaultSection, type ProposalSectionData } from "./proposal/sections";

export const DEFAULT_MESSAGE_TEMPLATES = [
  { channel: "EMAIL", key: "QUOTATION", name: "Quotation email", subject: "Quotation {{documentNumber}} from {{companyName}}", body: "Dear {{customerName}},\n\nPlease find attached our quotation {{documentNumber}} for {{documentTitle}}.\n\nTotal: {{amount}}\nValid until: {{validUntil}}\n\nWe would be happy to answer any questions.\n\nWarm regards,\n{{senderName}}\n{{companyName}}" },
  { channel: "EMAIL", key: "PROPOSAL", name: "Proposal email", subject: "Proposal: {{documentTitle}} — {{companyName}}", body: "Dear {{customerName}},\n\nThank you for the opportunity. Please find attached our proposal {{documentNumber}}: {{documentTitle}}.\n\nPackage: {{amount}}\nValid until: {{validUntil}}\n\nWarm regards,\n{{senderName}}\n{{companyName}}" },
  { channel: "EMAIL", key: "INVOICE", name: "Invoice email", subject: "Tax invoice {{documentNumber}} from {{companyName}}", body: "Dear {{customerName}},\n\nPlease find attached tax invoice {{documentNumber}}.\n\nAmount due: {{balance}}\nDue date: {{dueDate}}\n\nPayment details are included in the invoice.\n\nRegards,\n{{senderName}}\n{{companyName}}" },
  { channel: "EMAIL", key: "PROFORMA", name: "Proforma email", subject: "Proforma invoice {{documentNumber}} from {{companyName}}", body: "Dear {{customerName}},\n\nPlease find attached proforma invoice {{documentNumber}} for your approval / advance payment.\n\nAmount: {{amount}}\n\nPlease note this is not a tax invoice.\n\nRegards,\n{{senderName}}\n{{companyName}}" },
  { channel: "EMAIL", key: "PAYMENT_REMINDER", name: "Payment reminder email", subject: "Payment reminder: invoice {{documentNumber}}", body: "Dear {{customerName}},\n\nThis is a friendly reminder that {{balance}} is outstanding on invoice {{documentNumber}}, due on {{dueDate}}.\n\nIf you have already made the payment, please ignore this message or share the payment reference.\n\nRegards,\n{{senderName}}\n{{companyName}}" },
  { channel: "WHATSAPP", key: "QUOTATION", name: "Quotation WhatsApp", subject: null, body: "Hello {{customerName}}, please find our quotation {{documentNumber}} ({{amount}}). Valid until {{validUntil}}. — {{companyName}}" },
  { channel: "WHATSAPP", key: "PROPOSAL", name: "Proposal WhatsApp", subject: null, body: "Hello {{customerName}}, please find our proposal {{documentNumber}}: {{documentTitle}}. — {{companyName}}" },
  { channel: "WHATSAPP", key: "INVOICE", name: "Invoice WhatsApp", subject: null, body: "Hello {{customerName}}, please find tax invoice {{documentNumber}}. Amount due {{balance}} by {{dueDate}}. — {{companyName}}" },
  { channel: "WHATSAPP", key: "PROFORMA", name: "Proforma WhatsApp", subject: null, body: "Hello {{customerName}}, please find proforma invoice {{documentNumber}} ({{amount}}). — {{companyName}}" },
  { channel: "WHATSAPP", key: "PAYMENT_REMINDER", name: "Payment reminder WhatsApp", subject: null, body: "Hello {{customerName}}, a gentle reminder that {{balance}} is due on invoice {{documentNumber}} (due {{dueDate}}). Please ignore if already paid. — {{companyName}}" },
] as const;

function asset(name: string): Buffer | null {
  const p = path.join(process.cwd(), "prisma", "seed-assets", name);
  return existsSync(p) ? readFileSync(p) : null;
}

/** Idempotent base setup: company profile, sequences, admin user, message templates, integration prefs. */
export async function seedBase(db: PrismaClient, opts: { log?: (m: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  let company = await db.companyProfile.findFirst({ where: { isDefault: true } });
  if (!company) {
    const infinitia = asset("infinitia.png");
    const studio = asset("studiocraft.png");
    company = await db.companyProfile.create({
      data: {
        isDefault: true,
        brandName: "Infinitia Hub",
        coBrandName: "AI Studio Craft",
        tagline: "Practical AI-powered communication and automation",
        // Logos extracted from the supplied reference proposal; replace any time in Company Settings.
        logoPrimary: infinitia ? new Uint8Array(infinitia) : null,
        logoPrimaryMime: infinitia ? "image/png" : null,
        logoPrimaryTile: "light",
        logoSecondary: studio ? new Uint8Array(studio) : null,
        logoSecondaryMime: studio ? "image/png" : null,
        logoSecondaryTile: "dark",
        primaryColor: "#0D1235",
        accentColor: "#5B4CE6",
        // Contact details as they appear on the reference proposal. Legal name, GSTIN, address and
        // bank details are intentionally left blank — they must be entered by the business.
        phone: "+91 81472 62999",
        email: "info@aistudiocraft.in",
        documentFooter: "Infinitia Hub × AI Studio Craft",
        termsQuotation: "1. Prices are exclusive of GST unless stated otherwise.\n2. This quotation is valid until the date shown.\n3. Work begins after written acceptance and receipt of any agreed advance.\n4. Third-party platform charges are excluded unless explicitly listed.",
        termsInvoice: "1. Please quote the invoice number with your payment.\n2. Payment is due by the due date shown.\n3. Queries regarding this invoice should be raised within 7 days of receipt.",
        termsProposal: "Final scope, service dates and payment schedule will be confirmed in the final commercial agreement.",
        paymentInstructions: "Bank details to be configured in Company Settings.",
        defaultTaxRate: "18",
        roundingMode: "NEAREST_RUPEE",
        currency: "INR",
      },
    });
    log(`Created default company profile (${company.brandName} × ${company.coBrandName}).`);
  }
  for (const [type, prefix] of [["PROPOSAL", "PRP"], ["QUOTATION", "QT"], ["INVOICE", "INV"], ["PROFORMA", "PI"]] as const) {
    await db.documentSequence.upsert({
      where: { companyId_type: { companyId: company.id, type } },
      create: { companyId: company.id, type, prefix, nextNumber: 1, padding: 4, includeFinancialYear: true },
      update: {},
    });
  }

  // Invite-only: the first administrator is created without a password and receives a one-time link.
  if ((await db.user.count()) === 0) {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@aistudiocraft.local").toLowerCase();
    const { token } = await inviteUser(db, { name: process.env.SEED_ADMIN_NAME || "Administrator", email: adminEmail, role: "ADMIN" }, null);
    const base = (process.env.PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    log(`Created administrator ${adminEmail}. Open this one-time link to set the password and MFA (valid 72 hours):\n    ${base}/invite/${token}`);
  }

  for (const t of DEFAULT_MESSAGE_TEMPLATES) {
    await db.messageTemplate.upsert({
      where: { channel_key: { channel: t.channel, key: t.key } },
      create: { channel: t.channel, key: t.key, name: t.name, subject: t.subject, body: t.body },
      update: {},
    });
  }
  await db.integrationConfiguration.upsert({ where: { provider: "brevo" }, create: { provider: "brevo", settings: { replyTo: "" } }, update: {} });
  await db.integrationConfiguration.upsert({
    where: { provider: "whatsapp" },
    create: { provider: "whatsapp", settings: { documentTemplateName: "", reminderTemplateName: "", templateLanguage: "en", shareLinkHours: 72 } },
    update: {},
  });
  return company;
}

const SAMPLE_PRODUCTS = [
  { name: "WhatsApp Calling Package", category: "AI Voice Agents", sku: "SMP-WAC-200", unit: "Package", price: "20000", freq: "ANNUAL", short: "AI-powered WhatsApp calling, 200 minutes per month", inclusions: ["Customer enquiries and follow-ups", "Appointment or service reminders", "Routine customer communication"], exclusions: ["Usage beyond the included monthly allocation"] },
  { name: "AI Token Allocation (200K)", category: "AI Workflow Automation", sku: "SMP-TOK-200K", unit: "Allocation", price: "0", freq: "ANNUAL", short: "200,000 AI tokens for configured AI workflows", inclusions: ["Responses to customer questions", "Text-based enquiry processing"], exclusions: [] },
  { name: "AI Chatbot Development", category: "AI Chatbot Development", sku: "SMP-BOT-STD", unit: "Project", price: "35000", freq: "ONE_TIME", short: "Custom AI chatbot configured with approved business information", inclusions: ["Knowledge base setup", "FAQ configuration", "Website widget"], exclusions: ["Third-party platform fees"] },
  { name: "AI Voice Agent Setup", category: "AI Voice Agents", sku: "SMP-VOICE", unit: "Project", price: "50000", freq: "ONE_TIME", short: "Inbound/outbound AI voice agent configuration", inclusions: ["Call flow design", "Voice configuration", "Testing"], exclusions: ["Telecom charges"] },
  { name: "WhatsApp Automation Setup", category: "WhatsApp Automation", sku: "SMP-WA-AUTO", unit: "Project", price: "25000", freq: "ONE_TIME", short: "Automated WhatsApp flows for enquiries and follow-ups", inclusions: ["Up to 5 flows", "Template submission support"], exclusions: ["Meta conversation charges"] },
  { name: "Business Website Development", category: "Website Development", sku: "SMP-WEB-STD", unit: "Project", price: "45000", freq: "ONE_TIME", short: "Responsive business website up to 8 pages", inclusions: ["Design", "Development", "Basic SEO setup"], exclusions: ["Domain and hosting charges", "Content writing"] },
  { name: "CRM Implementation", category: "CRM Implementation", sku: "SMP-CRM", unit: "Project", price: "60000", freq: "ONE_TIME", short: "CRM configuration, data import and training", inclusions: ["Pipeline setup", "Data import", "Team training"], exclusions: ["CRM licence fees"] },
  { name: "Annual Maintenance", category: "Annual Maintenance", sku: "SMP-AMC", unit: "Year", price: "12000", freq: "ANNUAL", short: "Annual maintenance and minor updates", inclusions: ["Security updates", "Minor content changes"], exclusions: ["New feature development"] },
  { name: "AI Consulting", category: "Consulting", sku: "SMP-CONSULT", unit: "Hour", price: "2500", freq: "ONE_TIME", short: "AI strategy and solution consulting", inclusions: [], exclusions: [] },
] as const;

function line(p: Partial<DocumentInput["lineItems"][number]> & { name: string; unitPrice: string }): DocumentInput["lineItems"][number] {
  return { quantity: "1", unit: "Nos", discountType: "PERCENT", discountValue: "0", taxRate: "18", ...p };
}

export function anantMotorsProposalSections(): ProposalSectionData[] {
  const ctx = { customerName: "Anant Motors", brandLine: "Infinitia Hub × AI Studio Craft" };
  const s = (t: Parameters<typeof defaultSection>[0]) => defaultSection(t, ctx);
  return [
    { ...s("COVER"), content: { eyebrow: "Proposal for", body: "Smarter Customer Communication. Intelligent Automation. Better Customer Experiences.", highlightLabel: "Annual package price", highlight: "", note: "One price for the complete package, for the full year." } },
    {
      ...s("EXECUTIVE_SUMMARY"),
      title: "One Integrated Package for Anant Motors",
      content: {
        eyebrow: "Executive summary",
        body: "Infinitia Hub × AI Studio Craft proposes an integrated AI communication and automation solution for Anant Motors, combining WhatsApp calling, AI processing resources, and a complimentary AI chatbot in one annual commercial package.",
        highlightLabel: "Objective",
        highlight: "To support customer engagement, streamline routine interactions, and reduce repetitive manual communication through configured AI-powered workflows.",
        items: [
          { title: "WhatsApp Calling", tag: "Included", detail: "200 minutes per month, equivalent to 3 hours and 20 minutes" },
          { title: "AI Token Allocation", tag: "Free", detail: "200,000 AI tokens, provided as a free allocation" },
          { title: "AI Chatbot", tag: "Complimentary", detail: "Complimentary, included as a goodwill gesture" },
        ],
      },
    },
    { ...s("SERVICE_OVERVIEW"), title: "Service Details", content: { eyebrow: "Service" } },
    {
      ...s("FEATURE_BREAKDOWN"),
      title: "What Your Chatbot Can Be Configured to Do",
      content: {
        eyebrow: "Service 03 · AI Chatbot",
        items: [
          { title: "Answer common questions", detail: "Responses to frequently asked questions, using approved information about Anant Motors." },
          { title: "Assist with customer enquiries", detail: "Helps customers obtain relevant information without every routine question being answered manually." },
          { title: "Provide consistent information", detail: "Responses based on approved business information and the configured knowledge base." },
          { title: "Guide customers to the next step", detail: "Directs users towards an appropriate contact, enquiry process or other supported next step." },
          { title: "Support routine customer engagement", detail: "Helps manage repetitive enquiries and improves the initial customer interaction experience." },
          { title: "Reduce repetitive manual work", detail: "Allows staff to focus on enquiries and tasks that require personal attention." },
        ],
        note: "Supported channels, integrations, configuration and advanced functionality will depend on the agreed implementation scope.",
      },
    },
    {
      ...s("PRICING_SUMMARY"),
      title: "Your Annual AI Communication & Automation Package",
      content: {
        eyebrow: "Commercial summary",
        body: "One annual commercial package combining AI-powered WhatsApp calling, AI processing resources, and a complimentary chatbot.",
        note: "Payment schedule, service dates and other terms will be confirmed in the final commercial agreement.",
      },
    },
    {
      ...s("BUSINESS_VALUE"),
      content: {
        eyebrow: "Business value",
        items: [
          { title: "Structured customer communication", detail: "The configured WhatsApp calling solution can support customer communication and routine follow-up workflows within the included monthly allowance." },
          { title: "AI-powered responses", detail: "The included token allocation provides resources for configured AI interactions and supported automation workflows." },
          { title: "Convenient customer engagement", detail: "The chatbot can help customers obtain approved information and answers to common questions." },
          { title: "Reduced repetitive manual work", detail: "Automation of supported routine interactions can reduce the need for staff to handle every basic enquiry manually." },
          { title: "Consistent information delivery", detail: "Configured AI responses can help deliver information based on approved business content." },
          { title: "Added value through goodwill", detail: "Anant Motors receives a complimentary AI chatbot in recognition of the communication gaps experienced during earlier interactions." },
        ],
        highlightLabel: "Our objective",
        highlight: "Our objective is to help Anant Motors establish a more structured, convenient, and AI-enabled customer communication experience.",
      },
    },
    {
      ...s("COMMERCIAL_TERMS"),
      content: {
        eyebrow: "Transparency",
        itemsLabel: "Scope, services, usage & commercials",
        items: [
          { title: "Implementation scope", detail: "Final implementation scope and configuration will be agreed with Anant Motors." },
          { title: "WhatsApp calling", detail: "WhatsApp calling capabilities are subject to platform support and applicable account requirements." },
          { title: "Calling allocation", detail: "The included calling allocation is 200 minutes per month." },
          { title: "Chatbot scope", detail: "The chatbot’s channels, integrations, knowledge base and advanced functionality will depend on the agreed implementation scope." },
          { title: "Token consumption", detail: "AI token consumption varies according to the selected model and actual usage." },
          { title: "Token validity", detail: "The AI token allocation’s validity and renewal frequency must be confirmed before final acceptance." },
          { title: "Additional usage", detail: "Any usage beyond included allocations, if supported, must be discussed and approved separately before additional charges are incurred." },
          { title: "GST", detail: "Applicable GST will be charged in addition to the ₹20,000 annual package price." },
        ],
        secondaryLabel: "To be confirmed in the final commercial agreement",
        secondaryItems: [
          { title: "Contract commencement date" }, { title: "Annual service start and expiry dates" }, { title: "Payment schedule and deadline" },
          { title: "Token renewal frequency" }, { title: "Carry-forward of unused calling minutes" }, { title: "Additional usage charges" },
          { title: "Specific integrations or advanced features" }, { title: "Cancellation and renewal terms" },
        ],
      },
    },
    {
      ...s("CLOSING_PAGE"),
      content: {
        eyebrow: "Thank you",
        body: "Thank you, Anant Motors, for the opportunity to work together.\n\nThrough Infinitia Hub × AI Studio Craft, we look forward to supporting your customer communication and engagement with practical AI-powered solutions.",
        highlight: "",
        items: [
          { title: "Prepared by", detail: "Punithgowda KM, CMO" },
          { title: "Contact person", detail: "Kishore M" },
          { title: "Phone number", detail: "+91 81472 62999" },
          { title: "Email address", detail: "info@aistudiocraft.in\nkishore.m@aistudiocraft.in" },
        ],
      },
    },
  ];
}

export function anantMotorsProposalLines(): DocumentInput["lineItems"] {
  return [
    line({
      name: "WhatsApp Calling",
      description: "200 minutes per month, equivalent to 3 hours and 20 minutes",
      unit: "Package",
      unitPrice: "20000",
      billingFrequency: "ANNUAL",
      details: {
        treatment: "Included in the package",
        badge: "Included",
        metricLabel: "Monthly allocation",
        metricValue: "200",
        metricUnit: "Minutes per month",
        metricNote: "Equivalent to 3 hours and 20 minutes per month",
        detailedDescription: "An AI-enabled WhatsApp calling service designed to support customer communication and follow-up workflows, subject to the capabilities available in the final implementation.",
        inclusions: ["Customer enquiries and follow-ups", "Appointment or service reminders", "Routine customer communication", "Configured customer engagement workflows", "Supporting more structured communication processes"],
        benefits: ["Streamline supported customer communication", "Reduce repetitive manual calling tasks where automation is supported", "Organize routine follow-up workflows", "Improve consistency in customer engagement"],
      },
    }),
    line({
      name: "AI Token Allocation",
      description: "200,000 AI tokens",
      unit: "Allocation",
      unitPrice: "0",
      billingFrequency: "ANNUAL",
      details: {
        treatment: "Free allocation",
        badge: "Free included allocation",
        metricLabel: "Included",
        metricValue: "200K",
        metricUnit: "AI tokens",
        metricNote: "Good to know: 200,000 tokens is not the same as 200,000 messages, conversations or calls; usage per interaction varies. Validity and renewal schedule will be confirmed in the final commercial terms.",
        detailedDescription: "AI tokens are units of text processed by an AI model when it reads instructions, understands input, and generates responses. Token consumption varies according to the model, the length of the input, the length of the response, and the configuration of the AI workflow.",
        inclusions: ["Generating responses to customer questions", "Processing text-based enquiries", "Powering supported chatbot interactions", "Generating relevant business information", "Supporting other agreed AI automation workflows"],
        benefits: ["Enables AI-powered functionality without a separately charged token allocation within this offer"],
      },
    }),
    line({
      name: "AI Chatbot",
      description: "Configured chatbot within the agreed implementation scope",
      unit: "Project",
      unitPrice: "0",
      billingFrequency: "ANNUAL",
      details: {
        treatment: "Complimentary",
        badge: "Goodwill benefit",
        metricLabel: "Complimentary",
        metricValue: "₹0",
        metricUnit: "Additional charge",
        metricNote: "An AI-powered customer engagement assistant for Anant Motors, configured with approved business information.",
        detailedDescription: "As a goodwill gesture and in recognition of the communication gaps experienced during our earlier interactions, we are pleased to include an AI chatbot for Anant Motors at no additional charge.",
        benefits: ["More convenient customer interactions", "Faster handling of routine questions", "Consistent delivery of approved information", "Reduced repetitive manual responses", "A more organized initial enquiry experience"],
      },
    }),
  ];
}

/** Creates the sample dataset. Safe to call repeatedly: existing sample records are removed first. */
export async function seedSampleData(db: PrismaClient, userId: string | null, opts: { log?: (m: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  await clearSampleData(db);
  const company = await seedBase(db);

  for (const p of SAMPLE_PRODUCTS) {
    await db.productService.create({
      data: {
        name: p.name,
        category: p.category,
        sku: p.sku,
        unit: p.unit,
        defaultPrice: p.price,
        defaultQuantity: "1",
        taxRate: "18",
        hsnSac: "998314",
        billingFrequency: p.freq,
        shortDescription: p.short,
        detailedDescription: `${p.short}. (Sample catalogue item — adjust pricing and scope to your actual offering.)`,
        inclusions: [...p.inclusions],
        exclusions: [...p.exclusions],
        isSample: true,
      },
    });
  }

  const anant = await db.customer.create({
    data: {
      name: "Anant Motors",
      contactPerson: "Sample contact",
      email: "contact@anantmotors.example",
      phone: "+91 90000 00001",
      billingAddress: "Sample address — update before issuing real documents",
      state: "Karnataka",
      stateCode: "29",
      preferredChannel: "WHATSAPP",
      notes: "SAMPLE customer record created for demonstration, based on the reference proposal. Contact details are placeholders.",
      isSample: true,
    },
  });
  const northwind = await db.customer.create({
    data: { name: "Northwind Dental Clinic (Sample)", contactPerson: "Dr. A. Rao", email: "frontdesk@northwind.example", phone: "+91 90000 00002", billingAddress: "12 Sample Road, Chennai", state: "Tamil Nadu", stateCode: "33", preferredChannel: "EMAIL", isSample: true, notes: "Fictional sample customer." },
  });
  const meridian = await db.customer.create({
    data: { name: "Meridian Realty (Sample)", contactPerson: "S. Kapoor", email: "accounts@meridian.example", phone: "+91 90000 00003", billingAddress: "4th Floor, Sample Towers, Bengaluru", shippingAddress: "Site office, Whitefield, Bengaluru", state: "Karnataka", stateCode: "29", preferredChannel: "EMAIL", isSample: true, notes: "Fictional sample customer." },
  });

  const today = todayISO();
  const base = { companyId: company.id, notes: undefined, sections: [] as DocumentInput["sections"] };
  const create = async (input: DocumentInput) => saveDocument(db, documentSchema.parse(input), userId, undefined, { isSample: true });

  // 1. Proposal (reference-derived)
  const proposalId = await create({
    ...base,
    type: "PROPOSAL",
    customerId: anant.id,
    template: "PREMIUM_COMMERCIAL",
    title: "Annual AI Communication & Automation Package",
    issueDate: today,
    validUntil: addDaysISO(today, 7),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsProposal ?? undefined,
    lineItems: anantMotorsProposalLines(),
    sections: anantMotorsProposalSections(),
  });
  await setDocumentStatus(db, proposalId, "SENT", userId);

  // 2. Quotation for the same package — accepted, ready to convert
  const pkgLine = line({ name: "Annual AI Communication & Automation Package", description: "WhatsApp calling (200 min/month) · 200,000 AI tokens (free) · AI chatbot (complimentary)", unit: "Package", unitPrice: "20000", billingFrequency: "ANNUAL", hsnSac: "998314" });
  const quoteId = await create({
    ...base,
    type: "QUOTATION",
    customerId: anant.id,
    template: "PROFESSIONAL_QUOTATION",
    title: "Annual AI Communication & Automation Package",
    issueDate: addDaysISO(today, -2),
    validUntil: addDaysISO(today, 5),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsQuotation ?? undefined,
    paymentTerms: "100% advance on acceptance (sample terms).",
    lineItems: [pkgLine],
  });
  await setDocumentStatus(db, quoteId, "SENT", userId);
  await setDocumentStatus(db, quoteId, "ACCEPTED", userId);

  // 3. Quotation (draft, multi-line, discount) for Meridian
  await create({
    ...base,
    type: "QUOTATION",
    customerId: meridian.id,
    template: "PREMIUM_COMMERCIAL",
    title: "Website & CRM rollout",
    issueDate: today,
    validUntil: addDaysISO(today, 15),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsQuotation ?? undefined,
    lineItems: [
      line({ name: "Business Website Development", description: "Responsive website up to 8 pages", unit: "Project", unitPrice: "45000", discountType: "PERCENT", discountValue: "10", hsnSac: "998314" }),
      line({ name: "CRM Implementation", description: "Pipeline setup, data import and training", unit: "Project", unitPrice: "60000", hsnSac: "998314" }),
      line({ name: "AI Consulting", description: "Discovery workshops", unit: "Hour", quantity: "6", unitPrice: "2500", hsnSac: "998314" }),
    ],
  });

  // 4. Invoice — partially paid (inter-state, Northwind in Tamil Nadu)
  const inv1 = await create({
    ...base,
    type: "INVOICE",
    customerId: northwind.id,
    template: "PROFESSIONAL_INVOICE",
    title: "AI chatbot for patient enquiries",
    issueDate: addDaysISO(today, -20),
    dueDate: addDaysISO(today, 10),
    taxMode: "INTER_STATE",
    placeOfSupply: "Tamil Nadu",
    placeOfSupplyCode: "33",
    terms: company.termsInvoice ?? undefined,
    lineItems: [line({ name: "AI Chatbot Development", description: "Chatbot configured with clinic FAQs and appointment guidance", unit: "Project", unitPrice: "35000", hsnSac: "998314" })],
  });
  await issueInvoice(db, inv1, userId);
  await recordPayment(db, { documentId: inv1, paymentDate: addDaysISO(today, -15), amount: "20000", method: "BANK_TRANSFER", reference: "SAMPLE-NEFT-001", notes: "Sample advance payment" }, userId);

  // 5. Invoice — paid in full
  const inv2 = await create({
    ...base,
    type: "INVOICE",
    customerId: meridian.id,
    template: "PREMIUM_COMMERCIAL",
    title: "Annual maintenance",
    issueDate: addDaysISO(today, -40),
    dueDate: addDaysISO(today, -25),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsInvoice ?? undefined,
    lineItems: [line({ name: "Annual Maintenance", description: "Website maintenance — 12 months", unit: "Year", unitPrice: "12000", billingFrequency: "ANNUAL", hsnSac: "998314" })],
  });
  await issueInvoice(db, inv2, userId);
  await recordPayment(db, { documentId: inv2, paymentDate: addDaysISO(today, -30), amount: "14160", method: "UPI", reference: "SAMPLE-UPI-7781" }, userId);

  // 6. Invoice — overdue (issued, unpaid, past due)
  const inv3 = await create({
    ...base,
    type: "INVOICE",
    customerId: meridian.id,
    template: "PROFESSIONAL_INVOICE",
    title: "WhatsApp automation setup",
    issueDate: addDaysISO(today, -45),
    dueDate: addDaysISO(today, -15),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsInvoice ?? undefined,
    lineItems: [line({ name: "WhatsApp Automation Setup", description: "Five automated enquiry and follow-up flows", unit: "Project", unitPrice: "25000", hsnSac: "998314" })],
  });
  await issueInvoice(db, inv3, userId);

  // 7. Proforma for Anant Motors
  const pi = await create({
    ...base,
    type: "PROFORMA",
    customerId: anant.id,
    template: "PROFESSIONAL_INVOICE",
    title: "Advance for annual package",
    issueDate: today,
    dueDate: addDaysISO(today, 7),
    taxMode: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    placeOfSupplyCode: "29",
    terms: company.termsInvoice ?? undefined,
    lineItems: [pkgLine],
  });
  await setDocumentStatus(db, pi, "SENT", userId);

  log("Sample data created: 3 customers, 9 catalogue items, 1 proposal, 2 quotations, 3 invoices, 1 proforma.");
}

export async function clearSampleData(db: PrismaClient) {
  const sampleDocs = await db.document.findMany({ where: { isSample: true }, select: { id: true } });
  const ids = sampleDocs.map((d) => d.id);
  await db.$transaction([
    db.communicationLog.deleteMany({ where: { OR: [{ documentId: { in: ids } }, { customer: { isSample: true } }] } }),
    db.auditEvent.deleteMany({ where: { documentId: { in: ids } } }),
    // Break conversion links among sample docs before deleting
    db.document.updateMany({ where: { id: { in: ids } }, data: { convertedFromId: null } }),
    db.document.deleteMany({ where: { id: { in: ids } } }),
    db.customer.deleteMany({ where: { isSample: true, documents: { none: {} } } }),
    db.productService.deleteMany({ where: { isSample: true } }),
  ]);
}
