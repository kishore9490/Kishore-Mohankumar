import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { IntegrationError } from "./brevo";
import { DEFAULT_WA_API_VERSION, loadWhatsApp, whatsappStatus, type WhatsAppTemplateInfo } from "./config";

/**
 * WhatsApp Business Platform — Cloud API (Graph API).
 *   GET  /{phone-number-id}                 connection test
 *   GET  /{waba-id}/message_templates       approved templates
 *   POST /{phone-number-id}/media           upload PDF (no public URL needed)
 *   POST /{phone-number-id}/messages        send document / template
 *   Webhook: GET verification + POST with X-Hub-Signature-256
 * Credentials come from Settings → Integrations (encrypted) and never reach the browser.
 */

export { whatsappStatus };
import { normalizeWhatsAppNumber } from "./phone";
export { normalizeWhatsAppNumber };

function safeGraphError(status: number, body: unknown): string {
  const err = (body as { error?: { message?: string; code?: number; error_data?: { details?: string } } })?.error;
  const code = err?.code;
  if (status === 401 || code === 190) return "WhatsApp rejected the access token (expired or invalid). Update it in Settings → Integrations.";
  if (code === 131047) return "Not delivered: more than 24 hours since the customer last messaged. Configure an approved template for business-initiated messages.";
  if (code === 132001) return "The WhatsApp template does not exist or is not approved for this language.";
  if (code === 132000) return "The template parameters do not match the approved template (number of variables).";
  if (code === 131026) return "Message undeliverable: the recipient number may not be on WhatsApp.";
  if (code === 131030) return "The recipient is not in the allowed list for this test number. Add it in the Meta developer console.";
  const detail = err?.error_data?.details || err?.message || "";
  return `WhatsApp API error${code ? ` ${code}` : ""} (HTTP ${status})${detail ? `: ${String(detail).slice(0, 200)}` : ""}.`;
}

async function graph(path: string, init: RequestInit): Promise<unknown> {
  const { settings, secrets } = await loadWhatsApp();
  if (!secrets.accessToken) throw new IntegrationError("WhatsApp is not configured — add the access token in Settings → Integrations.");
  let res: Response;
  try {
    res = await fetch(`https://graph.facebook.com/${settings.apiVersion || DEFAULT_WA_API_VERSION}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${secrets.accessToken}`, ...(init.headers ?? {}) },
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

async function phoneNumberId(): Promise<string> {
  const id = (await loadWhatsApp()).settings.phoneNumberId;
  if (!id) throw new IntegrationError("WhatsApp phone number ID is missing in Settings → Integrations.");
  return encodeURIComponent(id);
}

export async function whatsappTestConnection(): Promise<{ displayPhoneNumber?: string; verifiedName?: string; qualityRating?: string }> {
  const body = (await graph(`/${await phoneNumberId()}?fields=display_phone_number,verified_name,quality_rating`, { method: "GET" })) as {
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
  };
  return { displayPhoneNumber: body?.display_phone_number, verifiedName: body?.verified_name, qualityRating: body?.quality_rating };
}

/** Lists message templates of the WhatsApp Business Account (needs the WABA ID). */
export async function whatsappListTemplates(): Promise<WhatsAppTemplateInfo[]> {
  const waba = (await loadWhatsApp()).settings.businessAccountId;
  if (!waba) throw new IntegrationError("Add the WhatsApp Business Account ID to load templates.");
  type Raw = { name: string; language: string; status: string; category?: string; components?: { type: string; format?: string; text?: string }[] };
  const body = (await graph(`/${encodeURIComponent(waba)}/message_templates?fields=name,language,status,category,components&limit=200`, { method: "GET" })) as { data?: Raw[] };
  return (body?.data ?? []).map((t) => {
    const header = t.components?.find((c) => c.type === "HEADER");
    const bodyText = t.components?.find((c) => c.type === "BODY")?.text ?? "";
    return {
      name: t.name,
      language: t.language,
      status: t.status,
      category: t.category,
      hasDocumentHeader: header?.format === "DOCUMENT",
      bodyParams: new Set(bodyText.match(/\{\{\s*\d+\s*\}\}/g) ?? []).size,
    };
  });
}

/** Uploads the PDF to WhatsApp media storage — avoids exposing any public document URL. */
export async function whatsappUploadPdf(pdf: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), filename);
  const body = (await graph(`/${await phoneNumberId()}/media`, { method: "POST", body: form })) as { id?: string };
  if (!body?.id) throw new IntegrationError("WhatsApp media upload did not return a media id.");
  return body.id;
}

export interface WhatsAppSendInput {
  to: string;
  mediaId?: string;
  filename?: string;
  caption?: string;
  template?: { name: string; language: string; bodyParams: string[]; documentHeader: boolean };
}

export async function whatsappSend(input: WhatsAppSendInput): Promise<{ messageId: string | null }> {
  let payload: Record<string, unknown>;
  if (input.template) {
    const components: unknown[] = [];
    if (input.template.documentHeader && input.mediaId)
      components.push({ type: "header", parameters: [{ type: "document", document: { id: input.mediaId, filename: input.filename } }] });
    if (input.template.bodyParams.length) components.push({ type: "body", parameters: input.template.bodyParams.map((t) => ({ type: "text", text: t.slice(0, 1000) })) });
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.to,
      type: "template",
      template: { name: input.template.name, language: { code: input.template.language }, ...(components.length ? { components } : {}) },
    };
  } else {
    if (!input.mediaId) throw new IntegrationError("A document is required for free-form messages.");
    payload = { messaging_product: "whatsapp", recipient_type: "individual", to: input.to, type: "document", document: { id: input.mediaId, filename: input.filename, caption: (input.caption ?? "").slice(0, 1024) } };
  }
  const body = (await graph(`/${await phoneNumberId()}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })) as { messages?: { id: string }[] };
  return { messageId: body?.messages?.[0]?.id ?? null };
}

/** Validates X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the app secret). */
export function verifyWebhookSignature(rawBody: string, header: string | null, appSecret: string | null | undefined): boolean {
  if (!appSecret || !header || !header.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(header.slice(7), "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type WebhookStatusUpdate = { messageId: string; status: string; timestamp?: string; errorTitle?: string };
export type WebhookInbound = { from: string; timestamp?: string };

type WebhookValue = {
  statuses?: { id: string; status: string; timestamp?: string; errors?: { title?: string; message?: string }[] }[];
  messages?: { from: string; timestamp?: string }[];
};

function values(payload: unknown): WebhookValue[] {
  const out: WebhookValue[] = [];
  for (const entry of ((payload as { entry?: unknown[] })?.entry ?? []) as { changes?: { value?: WebhookValue }[] }[])
    for (const change of entry.changes ?? []) if (change.value) out.push(change.value);
  return out;
}

export function extractStatusUpdates(payload: unknown): WebhookStatusUpdate[] {
  return values(payload).flatMap((v) =>
    (v.statuses ?? []).filter((s) => s?.id && s?.status).map((s) => ({ messageId: s.id, status: s.status, timestamp: s.timestamp, errorTitle: s.errors?.[0]?.title ?? s.errors?.[0]?.message })),
  );
}

/** Inbound customer messages — used only to track the 24-hour customer-service window (content is not stored). */
export function extractInboundMessages(payload: unknown): WebhookInbound[] {
  return values(payload).flatMap((v) => (v.messages ?? []).filter((m) => m?.from).map((m) => ({ from: m.from, timestamp: m.timestamp })));
}
