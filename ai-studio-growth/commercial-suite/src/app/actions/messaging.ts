"use server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { sendEmailSchema } from "@/lib/validation/schemas";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";
import { loadRenderableDocument } from "@/lib/documents/load";
import { pdfFileName, renderDocumentPdf } from "@/lib/pdf/render";
import { brevoSendEmail, brevoTestConnection, IntegrationError } from "@/lib/integrations/brevo";
import { brevoStatus, saveApp, saveBrevo } from "@/lib/integrations/config";
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

async function failLog(logId: string | null, e: unknown) {
  if (!logId) return;
  const msg = e instanceof IntegrationError || e instanceof ServiceError ? e.message : "Sending failed due to an unexpected error.";
  await prisma.communicationLog.update({ where: { id: logId }, data: { status: "FAILED", errorMessage: msg.slice(0, 500), statusUpdatedAt: new Date() } }).catch(() => {});
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
    return { ok: true, message: "Email accepted by Brevo for delivery. Delivery and opens update automatically when the Brevo webhook is configured." };
  } catch (e) {
    await failLog(logId, e);
    if (e instanceof IntegrationError) return { ok: false, error: e.message };
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
    return r.senderVerified === false ? { ok: false, error: message } : { ok: true, message };
  } catch (e) {
    const message = e instanceof IntegrationError ? e.message : "Connection test failed.";
    await saveBrevo({ lastTest: { at: new Date().toISOString(), ok: false, message } }).catch(() => {});
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
    return { ok: true, message: `Test email accepted by Brevo for ${email}.` };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
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
    return { ok: true, message: "Template saved" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}
