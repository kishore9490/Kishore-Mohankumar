"use server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { sendEmailSchema, sendWhatsAppSchema } from "@/lib/validation/schemas";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";
import { loadRenderableDocument } from "@/lib/documents/load";
import { pdfFileName, renderDocumentPdf } from "@/lib/pdf/render";
import { brevoSendEmail, brevoTestConnection, IntegrationError } from "@/lib/integrations/brevo";
import { whatsappListTemplates, whatsappSend, whatsappTestConnection, whatsappUploadPdf } from "@/lib/integrations/whatsapp";
import { brevoStatus, loadWhatsApp, saveApp, saveBrevo, saveWhatsApp, whatsappStatus } from "@/lib/integrations/config";
import { createShareLink } from "@/lib/integrations/share-links";
import { buildChatUrl, normalizeWhatsAppNumber } from "@/lib/integrations/phone";
import { templateVars } from "@/lib/integrations/messages";
import { assertIssuable } from "@/lib/services/documents";
import { audit } from "@/lib/services/audit";
import { DOCUMENT_TYPE_META, type DocumentType } from "@/lib/documents/meta";
import { rateLimit } from "@/lib/auth/rate-limit";

const WINDOW_MS = 24 * 3_600_000;

/** Documents must be in a sendable state with valid totals before anything leaves the system. */
async function loadSendable(documentId: string, messageType: "DOCUMENT" | "PAYMENT_REMINDER") {
  const raw = await prisma.document.findUnique({ where: { id: documentId }, include: { lineItems: true, customer: true } });
  if (!raw) throw new ServiceError("Document not found.");
  if (raw.status === "CANCELLED") throw new ServiceError("Cancelled documents cannot be sent.");
  if (raw.type === "INVOICE" && raw.status === "DRAFT") throw new ServiceError("Issue the invoice before sending it.");
  if (messageType === "PAYMENT_REMINDER" && (raw.type !== "INVOICE" || !["ISSUED", "PARTIALLY_PAID"].includes(raw.status)))
    throw new ServiceError("Payment reminders can only be sent for issued invoices with a balance due.");
  assertIssuable(raw.lineItems, raw.taxMode, raw.roundingMode, raw.grandTotal);
  const doc = await loadRenderableDocument(documentId);
  if (!doc) throw new ServiceError("Document not found.");
  return { raw, doc };
}

/** After a successful provider submission, a draft quotation/proposal/proforma becomes "Sent". */
async function markSentIfDraft(documentId: string, type: string, status: string, userId: string) {
  if (status === "DRAFT" && type !== "INVOICE") {
    await prisma.document.update({ where: { id: documentId }, data: { status: "SENT", sentAt: new Date() } });
    await audit(prisma, { documentId, userId, action: "document.status", summary: "Marked sent after delivery to provider" });
  }
}

async function failLog(logId: string | null, e: unknown) {
  if (!logId) return;
  const msg = e instanceof IntegrationError || e instanceof ServiceError ? e.message : "Sending failed due to an unexpected error.";
  await prisma.communicationLog.update({ where: { id: logId }, data: { status: "FAILED", errorMessage: msg.slice(0, 500), statusUpdatedAt: new Date() } }).catch(() => {});
  revalidatePath("/", "layout");
}

export async function sendDocumentEmailAction(input: z.input<typeof sendEmailSchema>): Promise<ActionResult> {
  let logId: string | null = null;
  try {
    const user = await assertUser();
    if (!rateLimit(`send:${user.id}`, 30, 60 * 60_000).ok) throw new ServiceError("Sending limit reached. Please wait before sending more messages.");
    const data = sendEmailSchema.parse(input);
    const { raw, doc } = await loadSendable(data.documentId, data.messageType);
    const status = await brevoStatus();
    const mock = status.mode === "mock";
    if (!status.configured && !mock) throw new ServiceError(`Email is not configured (missing ${status.missing.join(" and ")}). An administrator can add it in Settings → Integrations.`);

    const attachmentName = data.attachPdf ? pdfFileName(doc) : null;
    const log = await prisma.communicationLog.create({
      data: {
        customerId: raw.customerId, documentId: raw.id, channel: "EMAIL", messageType: data.messageType, mode: mock ? "DEV_MOCK" : "LIVE",
        recipient: data.to, subject: data.subject, status: mock ? "PREPARED" : "QUEUED", attachmentName, createdById: user.id,
      },
    });
    logId = log.id;

    const pdf = data.attachPdf ? await renderDocumentPdf(doc) : null;
    if (mock) {
      await prisma.communicationLog.update({ where: { id: log.id }, data: { errorMessage: "Development mock mode — no email was sent.", statusUpdatedAt: new Date() } });
      await audit(prisma, { documentId: raw.id, userId: user.id, action: "email.mock", summary: `Email to ${data.to} prepared in development mock mode (not sent)` });
      revalidatePath("/", "layout");
      return { ok: true, message: "Development mock mode: the email was prepared and logged but NOT sent." };
    }
    const result = await brevoSendEmail({
      to: data.to,
      toName: doc.customer.contactPerson ?? doc.customer.name,
      subject: data.subject,
      text: data.body,
      tags: [data.messageType === "PAYMENT_REMINDER" ? "payment-reminder" : raw.type.toLowerCase()],
      attachments: pdf && attachmentName ? [{ name: attachmentName, contentBase64: pdf.toString("base64") }] : undefined,
    });
    await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: result.messageId, statusUpdatedAt: new Date() } });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "email.sent", summary: `${data.messageType === "PAYMENT_REMINDER" ? "Payment reminder" : DOCUMENT_TYPE_META[raw.type as DocumentType].label} emailed to ${data.to} (accepted by Brevo)` });
    await markSentIfDraft(raw.id, raw.type, raw.status, user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Email accepted by Brevo for delivery. Delivery and opens update automatically when the Brevo webhook is configured." };
  } catch (e) {
    await failLog(logId, e);
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function sendDocumentWhatsAppAction(input: z.input<typeof sendWhatsAppSchema>): Promise<ActionResult> {
  let logId: string | null = null;
  try {
    const user = await assertUser();
    if (!rateLimit(`send:${user.id}`, 30, 60 * 60_000).ok) throw new ServiceError("Sending limit reached. Please wait before sending more messages.");
    const data = sendWhatsAppSchema.parse(input);
    const status = await whatsappStatus();
    if (!status.apiActive)
      throw new ServiceError(status.mode === "CLOUD_API" ? `WhatsApp Cloud API is not configured (missing ${status.missing.join(", ")}).` : "Automated sending is off — WhatsApp is set to the WhatsApp Business app (click-to-send).");
    const { raw, doc } = await loadSendable(data.documentId, data.messageType);
    if (!raw.customer.whatsappConsent) throw new ServiceError("This customer has no recorded WhatsApp opt-in. Record consent on the customer before sending via the API.");
    const s = status.settings;
    const to = normalizeWhatsAppNumber(data.to, s.defaultCountryCode || "91");
    if (!to) throw new ServiceError("Enter a valid WhatsApp number including the country code.");
    const templateName = data.messageType === "PAYMENT_REMINDER" ? s.reminderTemplateName || s.documentTemplateName : s.documentTemplateName;
    const tpl = templateName ? s.templates?.find((t) => t.name === templateName) : undefined;
    const inWindow = !!raw.customer.whatsappLastInboundAt && Date.now() - raw.customer.whatsappLastInboundAt.getTime() < WINDOW_MS;
    if (!templateName && !inWindow)
      throw new ServiceError("The customer has not messaged you in the last 24 hours, so WhatsApp only allows an approved template. Select a document template in Settings → Integrations, or use the manual option.");

    const filename = pdfFileName(doc);
    const log = await prisma.communicationLog.create({
      data: { customerId: raw.customerId, documentId: raw.id, channel: "WHATSAPP", messageType: data.messageType, mode: "LIVE", recipient: `+${to}`, status: "QUEUED", attachmentName: filename, createdById: user.id },
    });
    logId = log.id;
    const pdf = await renderDocumentPdf(doc);
    const mediaId = await whatsappUploadPdf(pdf, filename);
    const vars = templateVars(doc, user.name);
    const params = [vars.customerName, vars.documentNumber, data.messageType === "PAYMENT_REMINDER" ? vars.balance : vars.amount];
    const useTemplate = !!templateName; // templates work at any time; free-form only inside the 24-hour window
    const result = await whatsappSend({
      to,
      mediaId,
      filename,
      caption: data.message,
      template: useTemplate && templateName
        ? { name: templateName, language: tpl?.language || s.templateLanguage || "en", bodyParams: params.slice(0, tpl ? tpl.bodyParams : 3), documentHeader: tpl ? tpl.hasDocumentHeader : true }
        : undefined,
    });
    await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: result.messageId, statusUpdatedAt: new Date() } });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "whatsapp.sent", summary: `Sent to WhatsApp Cloud API for +${to}${useTemplate ? ` (template ${templateName})` : " (within 24-hour window)"}` });
    await markSentIfDraft(raw.id, raw.type, raw.status, user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Accepted by the WhatsApp Cloud API. Delivery and read status update when Meta reports them." };
  } catch (e) {
    await failLog(logId, e);
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

/**
 * WhatsApp Business app (click-to-send): builds a link that opens the team member's WhatsApp
 * Business app with the message prefilled. Nothing is sent by the app itself — the attempt is
 * logged as PREPARED and becomes "Sent (confirmed)" only when the team member confirms.
 * A secure, expiring document link is included when a public URL is configured.
 */
export async function prepareManualWhatsAppAction(input: z.input<typeof sendWhatsAppSchema>): Promise<ActionResult<{ url: string; linkIncluded: boolean; logId: string }>> {
  try {
    const user = await assertUser();
    const data = sendWhatsAppSchema.parse(input);
    const { raw } = await loadSendable(data.documentId, data.messageType);
    const { settings } = await loadWhatsApp();
    const to = normalizeWhatsAppNumber(data.to, settings.defaultCountryCode || "91");
    if (!to) throw new ServiceError("Enter a valid WhatsApp number including the country code.");
    const hours = settings.shareLinkHours ?? 72;
    const link = await createShareLink(raw.id, hours);
    const text = link ? `${data.message}\n\n📄 View / download (secure link, valid ${hours} hours):\n${link}` : data.message;
    const log = await prisma.communicationLog.create({
      data: {
        customerId: raw.customerId, documentId: raw.id, channel: "WHATSAPP_MANUAL", messageType: data.messageType, mode: "MANUAL", recipient: `+${to}`, status: "PREPARED",
        attachmentName: link ? null : pdfFileName((await loadRenderableDocument(raw.id))!), createdById: user.id,
        errorMessage: link ? null : "No public URL configured — the PDF was downloaded for you to attach in WhatsApp.",
      },
    });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "whatsapp.business", summary: `WhatsApp Business chat opened for +${to}` });
    revalidatePath("/", "layout");
    return { ok: true, data: { url: buildChatUrl(to, text, settings.openWith ?? "desktop"), linkIncluded: !!link, logId: log.id } };
  } catch (e) {
    return toActionError(e);
  }
}

/** The team member confirms they pressed Send in WhatsApp Business. */
export async function confirmWhatsAppSentAction(logId: string): Promise<ActionResult> {
  try {
    const user = await assertUser();
    const log = await prisma.communicationLog.findUnique({ where: { id: logId }, include: { document: true } });
    if (!log || log.channel !== "WHATSAPP_MANUAL") throw new ServiceError("Message not found.");
    await prisma.communicationLog.update({ where: { id: logId }, data: { status: "SENT_MANUAL", statusUpdatedAt: new Date() } });
    if (log.document) await markSentIfDraft(log.document.id, log.document.type, log.document.status, user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Marked as sent from WhatsApp Business." };
  } catch (e) {
    return toActionError(e);
  }
}

// ───────── Integration settings (admin) ─────────

const optionalSecret = z.string().trim().max(500).optional();

const generalSchema = z.object({
  publicUrl: z.string().trim().max(300).refine((v) => !v || /^https:\/\/[^\s/]+/.test(v), "Use the public https:// address of the app, e.g. https://quotes.example.com").optional(),
});

export async function saveGeneralSettingsAction(input: z.input<typeof generalSchema>): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const d = generalSchema.parse(input);
    await saveApp({ publicUrl: d.publicUrl ? d.publicUrl.replace(/\/$/, "") : undefined });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "General settings saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

const brevoSchema = z.object({
  senderEmail: z.string().trim().toLowerCase().email("Enter the verified sender email").or(z.literal("")),
  senderName: z.string().trim().max(100),
  replyTo: z.string().trim().toLowerCase().email("Enter a valid reply-to email").or(z.literal("")),
  deliveryMode: z.enum(["live", "mock"]),
  apiKey: optionalSecret, // blank = keep the stored key
  clearApiKey: z.boolean().optional(),
});

export async function saveBrevoSettingsAction(input: z.input<typeof brevoSchema>): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const d = brevoSchema.parse(input);
    if (d.apiKey && !/^xkeysib-[A-Za-z0-9-]{20,}$/.test(d.apiKey)) throw new ServiceError("That does not look like a Brevo API v3 key (it should start with “xkeysib-”).");
    await saveBrevo(
      { senderEmail: d.senderEmail || undefined, senderName: d.senderName || undefined, replyTo: d.replyTo || undefined, deliveryMode: d.deliveryMode },
      { apiKey: d.clearApiKey ? null as unknown as string : d.apiKey || undefined },
    );
    await audit(prisma, { userId: user.id, action: "integration.brevo", summary: `Brevo settings updated${d.apiKey ? " (API key replaced)" : ""}${d.clearApiKey ? " (API key removed)" : ""}` });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "Email settings saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

export async function regenerateBrevoWebhookTokenAction(): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    await saveBrevo({}, { webhookToken: randomBytes(24).toString("base64url") });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "New webhook URL generated — update it in Brevo." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function testBrevoAction(): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const r = await brevoTestConnection();
    const message = `Connected to Brevo${r.companyName ? ` (${r.companyName})` : ""}. ${r.senderMessage}`;
    await saveBrevo({ lastTest: { at: new Date().toISOString(), ok: r.senderVerified !== false, message } });
    revalidatePath("/settings", "layout");
    return r.senderVerified === false ? { ok: false, error: message } : { ok: true, message };
  } catch (e) {
    const message = e instanceof IntegrationError ? e.message : "Connection test failed.";
    await saveBrevo({ lastTest: { at: new Date().toISOString(), ok: false, message } }).catch(() => {});
    revalidatePath("/settings", "layout");
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function sendTestEmailAction(to: string): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const email = z.string().trim().toLowerCase().email("Enter a valid email address").parse(to);
    const status = await brevoStatus();
    if (!status.configured) throw new ServiceError(`Brevo is not configured. Missing: ${status.missing.join(", ")}.`);
    const log = await prisma.communicationLog.create({ data: { channel: "EMAIL", messageType: "TEST", mode: "LIVE", recipient: email, subject: "AI Studio Quote Studio test email", status: "QUEUED", createdById: user.id } });
    try {
      const r = await brevoSendEmail({ to: email, subject: "AI Studio Quote Studio test email", text: "This is a test email from AI Studio Quote Studio.\n\nIf you received it, Brevo is configured correctly.", tags: ["test"] });
      await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: r.messageId, statusUpdatedAt: new Date() } });
    } catch (e) {
      await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "FAILED", errorMessage: (e as Error).message.slice(0, 500), statusUpdatedAt: new Date() } });
      throw e;
    }
    revalidatePath("/communications");
    return { ok: true, message: `Test email accepted by Brevo for ${email}.` };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

const waModeSchema = z.object({
  mode: z.enum(["BUSINESS_APP", "CLOUD_API"]),
  openWith: z.enum(["desktop", "web", "phone"]),
  businessNumber: z.string().trim().max(20).refine((v) => !v || /^\+?[0-9 ()-]{8,20}$/.test(v), "Enter the WhatsApp Business number with country code"),
  defaultCountryCode: z.string().trim().regex(/^\d{1,4}$/, "Country code digits only, e.g. 91"),
  shareLinkHours: z.coerce.number().int().min(1).max(336),
});

export async function saveWhatsAppModeAction(input: z.input<typeof waModeSchema>): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const d = waModeSchema.parse(input);
    await saveWhatsApp({ mode: d.mode, openWith: d.openWith, businessNumber: d.businessNumber || undefined, defaultCountryCode: d.defaultCountryCode, shareLinkHours: d.shareLinkHours });
    await audit(prisma, { userId: user.id, action: "integration.whatsapp", summary: `WhatsApp mode set to ${d.mode === "BUSINESS_APP" ? "WhatsApp Business app" : "Cloud API"}` });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "WhatsApp settings saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

const templateName = z.string().trim().max(100).regex(/^[a-z0-9_]*$/, "Template names use lowercase letters, numbers and underscores");

const waSchema = z.object({
  phoneNumberId: z.string().trim().max(40).regex(/^\d*$/, "Phone number ID is numeric"),
  businessAccountId: z.string().trim().max(40).regex(/^\d*$/, "Business account ID is numeric"),
  apiVersion: z.string().trim().regex(/^v\d{1,2}\.\d$/, "API version looks like v21.0"),
  documentTemplateName: templateName,
  reminderTemplateName: templateName,
  templateLanguage: z.string().trim().min(2).max(10),
  testTemplateName: templateName,
  testTemplateLanguage: z.string().trim().min(2).max(10),
  accessToken: optionalSecret,
  appSecret: optionalSecret,
  verifyToken: optionalSecret,
  clear: z.array(z.enum(["accessToken", "appSecret", "verifyToken"])).optional(),
});

export async function saveWhatsAppSettingsAction(input: z.input<typeof waSchema>): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const d = waSchema.parse(input);
    const clear = new Set(d.clear ?? []);
    const secret = (k: "accessToken" | "appSecret" | "verifyToken") => (clear.has(k) ? (null as unknown as string) : d[k] || undefined);
    await saveWhatsApp(
      {
        phoneNumberId: d.phoneNumberId || undefined, businessAccountId: d.businessAccountId || undefined, apiVersion: d.apiVersion,
        documentTemplateName: d.documentTemplateName, reminderTemplateName: d.reminderTemplateName, templateLanguage: d.templateLanguage,
        testTemplateName: d.testTemplateName, testTemplateLanguage: d.testTemplateLanguage,
      },
      { accessToken: secret("accessToken"), appSecret: secret("appSecret"), verifyToken: secret("verifyToken") },
    );
    const changed = (["accessToken", "appSecret", "verifyToken"] as const).filter((k) => d[k] || clear.has(k));
    await audit(prisma, { userId: user.id, action: "integration.whatsapp", summary: `WhatsApp settings updated${changed.length ? ` (${changed.join(", ")} changed)` : ""}` });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "WhatsApp settings saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

export async function generateWhatsAppVerifyTokenAction(): Promise<ActionResult<{ token: string }>> {
  try {
    await assertUser("ADMIN");
    const token = randomBytes(18).toString("base64url");
    await saveWhatsApp({}, { verifyToken: token });
    revalidatePath("/settings", "layout");
    // Shown once so it can be pasted into the Meta developer console.
    return { ok: true, data: { token }, message: "Verify token generated — copy it into the Meta webhook settings now." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function testWhatsAppAction(): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const r = await whatsappTestConnection();
    const message = `Connected: ${r.verifiedName ?? "WhatsApp Business"} ${r.displayPhoneNumber ?? ""}`.trim();
    await saveWhatsApp({ lastTest: { at: new Date().toISOString(), ok: true, message, ...r } });
    revalidatePath("/settings", "layout");
    return { ok: true, message };
  } catch (e) {
    const message = e instanceof IntegrationError ? e.message : "Connection test failed.";
    await saveWhatsApp({ lastTest: { at: new Date().toISOString(), ok: false, message } }).catch(() => {});
    revalidatePath("/settings", "layout");
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function loadWhatsAppTemplatesAction(): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const templates = await whatsappListTemplates();
    await saveWhatsApp({ templates, templatesLoadedAt: new Date().toISOString() });
    revalidatePath("/settings", "layout");
    const approved = templates.filter((t) => t.status === "APPROVED").length;
    return { ok: true, message: `Loaded ${templates.length} template(s), ${approved} approved.` };
  } catch (e) {
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function sendWhatsAppTestAction(to: string): Promise<ActionResult> {
  let logId: string | null = null;
  try {
    const user = await assertUser("ADMIN");
    const status = await whatsappStatus();
    if (!status.configured) throw new ServiceError(`WhatsApp is not configured (missing ${status.missing.join(", ")}).`);
    const number = normalizeWhatsAppNumber(to);
    if (!number) throw new ServiceError("Enter a valid WhatsApp number including the country code.");
    const name = status.settings.testTemplateName || "hello_world";
    const language = status.settings.testTemplateLanguage || "en_US";
    const log = await prisma.communicationLog.create({ data: { channel: "WHATSAPP", messageType: "TEST", mode: "LIVE", recipient: `+${number}`, status: "QUEUED", createdById: user.id } });
    logId = log.id;
    const r = await whatsappSend({ to: number, template: { name, language, bodyParams: [], documentHeader: false } });
    await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: r.messageId, statusUpdatedAt: new Date() } });
    revalidatePath("/communications");
    return { ok: true, message: `Test template “${name}” accepted for +${number}.` };
  } catch (e) {
    await failLog(logId, e);
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

const templateSchema = z.object({ id: z.string().min(1), subject: z.string().trim().max(200).optional(), body: z.string().trim().min(1, "Message body is required").max(5000) });

export async function saveMessageTemplateAction(input: z.input<typeof templateSchema>): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const d = templateSchema.parse(input);
    await prisma.messageTemplate.update({ where: { id: d.id }, data: { subject: d.subject ?? null, body: d.body } });
    revalidatePath("/settings", "layout");
    return { ok: true, message: "Template saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}
