import "server-only";
import { brevoStatus, loadBrevo } from "./config";

/**
 * Brevo transactional email — REST API v3.
 *   POST /v3/smtp/email  (send)     GET /v3/account (connection)     GET /v3/senders (sender verification)
 * Credentials come from Settings → Integrations (encrypted in the database) and never reach the browser.
 */
const BREVO_API = "https://api.brevo.com/v3";

export class IntegrationError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

export { brevoStatus };

/** Mock delivery only when explicitly selected in Settings and never in production. */
export async function emailMockMode(): Promise<boolean> {
  return (await brevoStatus()).mode === "mock";
}

function safeProviderMessage(status: number, body: unknown): string {
  const b = body as { code?: string; message?: string } | null;
  const msg = b?.message ? String(b.message).slice(0, 200) : "";
  if (status === 401) return "Brevo rejected the API key (401 Unauthorized). Check the key in Settings → Integrations.";
  if (status === 400) return `Brevo rejected the request: ${msg || "bad request"}.`;
  if (status === 402) return "Brevo account has insufficient credits or the plan does not allow this send (402).";
  if (status === 403) return `Brevo refused the request (403)${msg ? `: ${msg}` : ""}. Check that the sender is verified and the IP is authorised.`;
  if (status === 429) return "Brevo rate limit reached (429). Try again shortly.";
  return `Brevo returned HTTP ${status}${msg ? `: ${msg}` : ""}.`;
}

async function brevoFetch(path: string, init: RequestInit, apiKeyOverride?: string): Promise<unknown> {
  const key = apiKeyOverride ?? (await loadBrevo()).secrets.apiKey;
  if (!key) throw new IntegrationError("Brevo is not configured — add the API key in Settings → Integrations.");
  let res: Response;
  try {
    res = await fetch(`${BREVO_API}${path}`, {
      ...init,
      headers: { "api-key": key, accept: "application/json", "content-type": "application/json", ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch (e) {
    throw new IntegrationError(`Could not reach Brevo: ${(e as Error).name === "TimeoutError" ? "request timed out" : "network error"}.`);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) throw new IntegrationError(safeProviderMessage(res.status, body), res.status);
  return body;
}

/** Checks the API key and whether the configured sender is a verified, active Brevo sender. */
export async function brevoTestConnection(): Promise<{ email?: string; companyName?: string; senderVerified: boolean | null; senderMessage: string }> {
  const { settings } = await loadBrevo();
  const account = (await brevoFetch("/account", { method: "GET" })) as { email?: string; companyName?: string };
  let senderVerified: boolean | null = null;
  let senderMessage = "No sender email configured.";
  if (settings.senderEmail) {
    try {
      const senders = (await brevoFetch("/senders", { method: "GET" })) as { senders?: { email: string; active: boolean }[] };
      const match = senders.senders?.find((s) => s.email.toLowerCase() === settings.senderEmail!.toLowerCase());
      senderVerified = !!match?.active;
      senderMessage = match ? (match.active ? `Sender ${match.email} is verified and active.` : `Sender ${match.email} exists but is not active/verified in Brevo.`) : `Sender ${settings.senderEmail} is not registered in Brevo — add and verify it under Senders, Domains & Dedicated IPs.`;
    } catch (e) {
      senderMessage = `Could not check senders: ${(e as Error).message}`;
    }
  }
  return { email: account?.email, companyName: account?.companyName, senderVerified, senderMessage };
}

export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  attachments?: { name: string; contentBase64: string }[];
  tags?: string[];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function textToHtml(text: string): string {
  const paras = text.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br/>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#5B4CE6">$1</a>')}</p>`);
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#121733">${paras.join("")}</div>`;
}

export async function brevoSendEmail(msg: EmailMessage): Promise<{ messageId: string | null }> {
  const status = await brevoStatus();
  if (!status.configured) throw new IntegrationError(`Brevo is not configured. Missing: ${status.missing.join(", ")}.`);
  const body = (await brevoFetch("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      sender: { email: status.senderEmail, name: status.senderName ?? undefined },
      to: [{ email: msg.to, name: msg.toName || undefined }],
      ...(status.replyTo ? { replyTo: { email: status.replyTo } } : {}),
      subject: msg.subject,
      textContent: msg.text,
      htmlContent: textToHtml(msg.text),
      ...(msg.tags?.length ? { tags: msg.tags } : {}),
      ...(msg.attachments?.length ? { attachment: msg.attachments.map((a) => ({ name: a.name, content: a.contentBase64 })) } : {}),
    }),
  })) as { messageId?: string };
  return { messageId: body?.messageId ?? null };
}

/** Maps Brevo transactional webhook events to delivery statuses (null = informational only). */
export function mapBrevoEvent(event: string): "DELIVERED" | "READ" | "FAILED" | null {
  switch (event) {
    case "delivered":
      return "DELIVERED";
    case "opened":
    case "unique_opened":
    case "click":
      return "READ";
    case "hard_bounce":
    case "blocked":
    case "invalid_email":
    case "error":
    case "spam":
      return "FAILED";
    default:
      return null; // request, deferred, soft_bounce, unsubscribed …
  }
}
