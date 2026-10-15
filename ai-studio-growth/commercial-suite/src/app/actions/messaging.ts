"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { sendEmailSchema, sendWhatsAppSchema } from "@/lib/validation/schemas";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";
import { loadRenderableDocument } from "@/lib/documents/load";
import { pdfFileName, renderDocumentPdf } from "@/lib/pdf/render";
import { brevoSendEmail, brevoStatus, brevoTestConnection, emailMockMode, IntegrationError } from "@/lib/integrations/brevo";
import { normalizeWhatsAppNumber, whatsappSendDocument, whatsappStatus, whatsappTestConnection, whatsappUploadPdf } from "@/lib/integrations/whatsapp";
import { createShareLink } from "@/lib/integrations/share-links";
import { templateVars } from "@/lib/integrations/messages";
import { assertIssuable } from "@/lib/services/documents";
import { audit } from "@/lib/services/audit";
import { DOCUMENT_TYPE_META, type DocumentType } from "@/lib/documents/meta";
import { rateLimit } from "@/lib/auth/rate-limit";

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

export async function sendDocumentEmailAction(input: z.input<typeof sendEmailSchema>): Promise<ActionResult> {
  let logId: string | null = null;
  try {
    const user = await assertUser();
    if (!rateLimit(`send:${user.id}`, 30, 60 * 60_000).ok) throw new ServiceError("Sending limit reached. Please wait before sending more messages.");
    const data = sendEmailSchema.parse(input);
    const { raw, doc } = await loadSendable(data.documentId, data.messageType);
    const status = brevoStatus();
    const mock = emailMockMode();
    if (!status.configured && !mock) throw new ServiceError(`Email is not configured. Add ${status.missing.join(" and ")} to the server environment (see Integration Settings).`);

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
      attachments: pdf && attachmentName ? [{ name: attachmentName, contentBase64: pdf.toString("base64") }] : undefined,
    });
    await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: result.messageId, statusUpdatedAt: new Date() } });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "email.sent", summary: `${data.messageType === "PAYMENT_REMINDER" ? "Payment reminder" : DOCUMENT_TYPE_META[raw.type as DocumentType].label} emailed to ${data.to} (accepted by Brevo)` });
    await markSentIfDraft(raw.id, raw.type, raw.status, user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Email accepted by Brevo for delivery." };
  } catch (e) {
    if (logId) {
      const msg = e instanceof IntegrationError || e instanceof ServiceError ? e.message : "Sending failed due to an unexpected error.";
      await prisma.communicationLog.update({ where: { id: logId }, data: { status: "FAILED", errorMessage: msg.slice(0, 500), statusUpdatedAt: new Date() } }).catch(() => {});
      revalidatePath("/", "layout");
    }
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

interface WhatsAppSettings {
  documentTemplateName?: string;
  reminderTemplateName?: string;
  templateLanguage?: string;
  shareLinkHours?: number;
}

async function whatsappSettings(): Promise<WhatsAppSettings> {
  const cfg = await prisma.integrationConfiguration.findUnique({ where: { provider: "whatsapp" } });
  return (cfg?.settings as WhatsAppSettings) ?? {};
}

export async function sendDocumentWhatsAppAction(input: z.input<typeof sendWhatsAppSchema>): Promise<ActionResult> {
  let logId: string | null = null;
  try {
    const user = await assertUser();
    if (!rateLimit(`send:${user.id}`, 30, 60 * 60_000).ok) throw new ServiceError("Sending limit reached. Please wait before sending more messages.");
    const data = sendWhatsAppSchema.parse(input);
    const status = whatsappStatus();
    if (!status.configured) throw new ServiceError(`WhatsApp Cloud API is not configured (missing ${status.missing.join(", ")}). Use “Open WhatsApp manually” instead.`);
    const { raw, doc } = await loadSendable(data.documentId, data.messageType);
    if (!raw.customer.whatsappConsent) throw new ServiceError("This customer has no recorded WhatsApp opt-in. Record consent on the customer before sending via the API.");
    const to = normalizeWhatsAppNumber(data.to);
    if (!to) throw new ServiceError("Enter a valid WhatsApp number including the country code.");
    const settings = await whatsappSettings();
    const templateName = data.messageType === "PAYMENT_REMINDER" ? settings.reminderTemplateName || settings.documentTemplateName : settings.documentTemplateName;
    const filename = pdfFileName(doc);

    const log = await prisma.communicationLog.create({
      data: { customerId: raw.customerId, documentId: raw.id, channel: "WHATSAPP", messageType: data.messageType, mode: "LIVE", recipient: `+${to}`, status: "QUEUED", attachmentName: filename, createdById: user.id },
    });
    logId = log.id;
    const pdf = await renderDocumentPdf(doc);
    const mediaId = await whatsappUploadPdf(pdf, filename);
    const vars = templateVars(doc, user.name);
    const result = await whatsappSendDocument({
      to,
      mediaId,
      filename,
      caption: data.message,
      template: templateName ? { name: templateName, language: settings.templateLanguage || "en", bodyParams: [vars.customerName, vars.documentNumber, data.messageType === "PAYMENT_REMINDER" ? vars.balance : vars.amount] } : undefined,
    });
    await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: result.messageId, statusUpdatedAt: new Date() } });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "whatsapp.sent", summary: `Sent to WhatsApp Cloud API for +${to}${templateName ? ` (template ${templateName})` : ""}` });
    await markSentIfDraft(raw.id, raw.type, raw.status, user.id);
    revalidatePath("/", "layout");
    return { ok: true, message: "Accepted by the WhatsApp Cloud API. Delivery status will update when Meta reports it." };
  } catch (e) {
    if (logId) {
      const msg = e instanceof IntegrationError || e instanceof ServiceError ? e.message : "Sending failed due to an unexpected error.";
      await prisma.communicationLog.update({ where: { id: logId }, data: { status: "FAILED", errorMessage: msg.slice(0, 500), statusUpdatedAt: new Date() } }).catch(() => {});
      revalidatePath("/", "layout");
    }
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

/**
 * Manual fallback: returns a wa.me link with a prefilled message. Nothing is sent by the app;
 * the attempt is logged as PREPARED (manual). A secure short-lived link is included only when a
 * public HTTPS URL is configured.
 */
export async function prepareManualWhatsAppAction(input: z.input<typeof sendWhatsAppSchema>): Promise<ActionResult<{ url: string; linkIncluded: boolean }>> {
  try {
    const user = await assertUser();
    const data = sendWhatsAppSchema.parse(input);
    const { raw } = await loadSendable(data.documentId, data.messageType);
    const to = normalizeWhatsAppNumber(data.to);
    if (!to) throw new ServiceError("Enter a valid WhatsApp number including the country code.");
    const settings = await whatsappSettings();
    const link = await createShareLink(raw.id, settings.shareLinkHours ?? 72);
    const text = link ? `${data.message}\n\nView document (secure link, expires in ${settings.shareLinkHours ?? 72} hours): ${link}` : data.message;
    await prisma.communicationLog.create({
      data: { customerId: raw.customerId, documentId: raw.id, channel: "WHATSAPP_MANUAL", messageType: data.messageType, mode: "MANUAL", recipient: `+${to}`, status: "PREPARED", createdById: user.id, errorMessage: link ? null : "No public URL configured — attach the downloaded PDF manually in WhatsApp." },
    });
    await audit(prisma, { documentId: raw.id, userId: user.id, action: "whatsapp.manual", summary: `Manual WhatsApp message prepared for +${to} (not sent by the app)` });
    revalidatePath("/", "layout");
    return { ok: true, data: { url: `https://wa.me/${to}?text=${encodeURIComponent(text)}`, linkIncluded: !!link } };
  } catch (e) {
    return toActionError(e);
  }
}

// ───────── Integration settings ─────────

export async function testBrevoAction(): Promise<ActionResult<{ email?: string; companyName?: string }>> {
  try {
    await assertUser("ADMIN");
    const r = await brevoTestConnection();
    return { ok: true, data: r, message: `Connected to Brevo${r.companyName ? ` (${r.companyName})` : ""}.` };
  } catch (e) {
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function sendTestEmailAction(to: string): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const email = z.string().trim().toLowerCase().email("Enter a valid email address").parse(to);
    const status = brevoStatus();
    if (!status.configured) throw new ServiceError(`Brevo is not configured. Missing: ${status.missing.join(", ")}.`);
    const log = await prisma.communicationLog.create({ data: { channel: "EMAIL", messageType: "TEST", mode: "LIVE", recipient: email, subject: "Commercial Suite test email", status: "QUEUED", createdById: user.id } });
    try {
      const r = await brevoSendEmail({ to: email, subject: "Commercial Suite test email", text: "This is a test email from AI Studio Craft Commercial Suite.\n\nIf you received it, Brevo is configured correctly." });
      await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "SENT_TO_PROVIDER", providerMessageId: r.messageId, statusUpdatedAt: new Date() } });
    } catch (e) {
      await prisma.communicationLog.update({ where: { id: log.id }, data: { status: "FAILED", errorMessage: (e as Error).message.slice(0, 500), statusUpdatedAt: new Date() } });
      throw e;
    }
    revalidatePath("/communications");
    return { ok: true, message: `Test email accepted by Brevo for ${email}.` };
  } catch (e) {
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

export async function testWhatsAppAction(): Promise<ActionResult<{ displayPhoneNumber?: string; verifiedName?: string; qualityRating?: string }>> {
  try {
    await assertUser("ADMIN");
    const r = await whatsappTestConnection();
    await prisma.integrationConfiguration.update({
      where: { provider: "whatsapp" },
      data: { settings: { ...(await whatsappSettings()), lastTest: { at: new Date().toISOString(), displayPhoneNumber: r.displayPhoneNumber, verifiedName: r.verifiedName } } as Prisma.InputJsonValue },
    });
    revalidatePath("/settings/integrations");
    return { ok: true, data: r, message: `Connected: ${r.verifiedName ?? "WhatsApp Business"} ${r.displayPhoneNumber ?? ""}`.trim() };
  } catch (e) {
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
    return toActionError(e);
  }
}

const waSettingsSchema = z.object({
  documentTemplateName: z.string().trim().max(100).regex(/^[a-z0-9_]*$/, "Template names use lowercase letters, numbers and underscores"),
  reminderTemplateName: z.string().trim().max(100).regex(/^[a-z0-9_]*$/, "Template names use lowercase letters, numbers and underscores"),
  templateLanguage: z.string().trim().min(2).max(10),
  shareLinkHours: z.coerce.number().int().min(1).max(336),
});

export async function saveWhatsAppSettingsAction(input: z.input<typeof waSettingsSchema>): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const data = waSettingsSchema.parse(input);
    const current = await whatsappSettings();
    await prisma.integrationConfiguration.upsert({
      where: { provider: "whatsapp" },
      create: { provider: "whatsapp", settings: data },
      update: { settings: { ...current, ...data } as Prisma.InputJsonValue },
    });
    revalidatePath("/settings/integrations");
    return { ok: true, message: "WhatsApp settings saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

const templateSchema = z.object({ id: z.string().min(1), subject: z.string().trim().max(200).optional(), body: z.string().trim().min(1, "Message body is required").max(5000) });

export async function saveMessageTemplateAction(input: z.input<typeof templateSchema>): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const d = templateSchema.parse(input);
    await prisma.messageTemplate.update({ where: { id: d.id }, data: { subject: d.subject ?? null, body: d.body } });
    revalidatePath("/settings/integrations");
    return { ok: true, message: "Template saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

