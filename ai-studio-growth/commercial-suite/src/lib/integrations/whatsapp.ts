import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { IntegrationError } from "./brevo";

/**
 * WhatsApp Business Platform — Cloud API (Graph API).
 *   Media upload: POST /{version}/{phone-number-id}/media
 *   Messages:     POST /{version}/{phone-number-id}/messages
 *   Webhooks:     GET verification (hub.challenge) + POST with X-Hub-Signature-256
 * Requires a Meta business account, a registered phone number and, for business-initiated
 * conversations, an approved message template. Tokens never leave the server.
 */

export interface WhatsAppStatus {
  configured: boolean;
  missing: string[];
  apiVersion: string;
  webhookConfigured: boolean;
  phoneNumberId: string | null;
}

export function whatsappStatus(): WhatsAppStatus {
  const missing: string[] = [];
  if (!process.env.WHATSAPP_ACCESS_TOKEN) missing.push("WHATSAPP_ACCESS_TOKEN");
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) missing.push("WHATSAPP_PHONE_NUMBER_ID");
  return {
    configured: missing.length === 0,
    missing,
    apiVersion: apiVersion(),
    webhookConfigured: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && !!process.env.WHATSAPP_APP_SECRET,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? null,
  };
}

function apiVersion() {
  return process.env.WHATSAPP_API_VERSION || "v21.0";
}

function base() {
  return `https://graph.facebook.com/${apiVersion()}`;
}

/** Normalises to digits-only international format (Cloud API expects country code, no '+'). 10-digit numbers are assumed Indian (+91). */
export function normalizeWhatsAppNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

function safeGraphError(status: number, body: unknown): string {
  const err = (body as { error?: { message?: string; code?: number; error_data?: { details?: string } } })?.error;
  const code = err?.code;
  if (status === 401 || code === 190) return "WhatsApp rejected the access token (expired or invalid). Update WHATSAPP_ACCESS_TOKEN.";
  if (code === 131047) return "Message not delivered: more than 24 hours since the customer last messaged. Configure an approved template to send business-initiated messages.";
  if (code === 132001) return "The configured WhatsApp template does not exist or is not approved for this language.";
  if (code === 131026) return "Message undeliverable: the recipient number may not be on WhatsApp.";
  const detail = err?.error_data?.details || err?.message || "";
  return `WhatsApp API error${code ? ` ${code}` : ""} (HTTP ${status})${detail ? `: ${String(detail).slice(0, 200)}` : ""}.`;
}

async function graph(path: string, init: RequestInit): Promise<unknown> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new IntegrationError("WhatsApp is not configured (WHATSAPP_ACCESS_TOKEN is missing).");
  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
  } catch (e) {
    throw new IntegrationError(`Could not reach the WhatsApp Cloud API: ${(e as Error).name === "TimeoutError" ? "request timed out" : "network error"}.`);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) throw new IntegrationError(safeGraphError(res.status, body), res.status);
  return body;
}

export async function whatsappTestConnection(): Promise<{ displayPhoneNumber?: string; verifiedName?: string; qualityRating?: string }> {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new IntegrationError("WHATSAPP_PHONE_NUMBER_ID is missing.");
  const body = (await graph(`/${encodeURIComponent(id)}?fields=display_phone_number,verified_name,quality_rating`, { method: "GET" })) as {
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
  };
  return { displayPhoneNumber: body?.display_phone_number, verifiedName: body?.verified_name, qualityRating: body?.quality_rating };
}

/** Uploads the PDF to WhatsApp media storage — avoids exposing any public document URL. */
export async function whatsappUploadPdf(pdf: Buffer, filename: string): Promise<string> {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), filename);
  const body = (await graph(`/${encodeURIComponent(id)}/media`, { method: "POST", body: form })) as { id?: string };
  if (!body?.id) throw new IntegrationError("WhatsApp media upload did not return a media id.");
  return body.id;
}

export interface WhatsAppSendInput {
  to: string;
  mediaId: string;
  filename: string;
  caption: string;
  template?: { name: string; language: string; bodyParams: string[] };
}

export async function whatsappSendDocument(input: WhatsAppSendInput): Promise<{ messageId: string | null }> {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const payload = input.template
    ? {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to,
        type: "template",
        template: {
          name: input.template.name,
          language: { code: input.template.language },
          components: [
            { type: "header", parameters: [{ type: "document", document: { id: input.mediaId, filename: input.filename } }] },
            ...(input.template.bodyParams.length ? [{ type: "body", parameters: input.template.bodyParams.map((t) => ({ type: "text", text: t.slice(0, 1000) })) }] : []),
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: input.to,
        type: "document",
        document: { id: input.mediaId, filename: input.filename, caption: input.caption.slice(0, 1024) },
      };
  const body = (await graph(`/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })) as { messages?: { id: string }[] };
  return { messageId: body?.messages?.[0]?.id ?? null };
}

/** Validates X-Hub-Signature-256 using the app secret (HMAC-SHA256 of the raw request body). */
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header || !header.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(header.slice(7), "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type WebhookStatusUpdate = { messageId: string; status: string; timestamp?: string; errorTitle?: string };

export function extractStatusUpdates(payload: unknown): WebhookStatusUpdate[] {
  const out: WebhookStatusUpdate[] = [];
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const entry of entries as { changes?: { value?: { statuses?: { id: string; status: string; timestamp?: string; errors?: { title?: string; message?: string }[] }[] } }[] }[]) {
    for (const change of entry.changes ?? []) {
      for (const s of change.value?.statuses ?? []) {
        if (s?.id && s?.status) out.push({ messageId: s.id, status: s.status, timestamp: s.timestamp, errorTitle: s.errors?.[0]?.title ?? s.errors?.[0]?.message });
      }
    }
  }
  return out;
}
