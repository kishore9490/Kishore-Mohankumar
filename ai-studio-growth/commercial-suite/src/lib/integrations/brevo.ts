import "server-only";

/**
 * Brevo transactional email (REST API v3: POST https://api.brevo.com/v3/smtp/email).
 * Secrets are read from server environment variables only and are never logged or sent to the browser.
 */
const BREVO_API = "https://api.brevo.com/v3";

export interface BrevoStatus {
  configured: boolean;
  mode: "live" | "mock";
  senderEmail: string | null;
  senderName: string | null;
  missing: string[];
}

export function brevoStatus(): BrevoStatus {
  const missing: string[] = [];
  if (!process.env.BREVO_API_KEY) missing.push("BREVO_API_KEY");
  if (!process.env.BREVO_SENDER_EMAIL) missing.push("BREVO_SENDER_EMAIL");
  return {
    configured: missing.length === 0,
    mode: emailMockMode() ? "mock" : "live",
    senderEmail: process.env.BREVO_SENDER_EMAIL ?? null,
    senderName: process.env.BREVO_SENDER_NAME ?? null,
    missing,
  };
}

/** Mock delivery only when explicitly requested and never in production. */
export function emailMockMode(): boolean {
  return process.env.EMAIL_DELIVERY_MODE === "mock" && process.env.NODE_ENV !== "production";
}

export class IntegrationError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

function safeProviderMessage(status: number, body: unknown): string {
  const b = body as { code?: string; message?: string } | null;
  const msg = b?.message ? String(b.message).slice(0, 200) : "";
  if (status === 401) return "Brevo rejected the API key (401 Unauthorized). Check BREVO_API_KEY.";
  if (status === 400) return `Brevo rejected the request: ${msg || "bad request"}.`;
  if (status === 402) return "Brevo account has insufficient credits or the plan does not allow this send (402).";
  if (status === 429) return "Brevo rate limit reached (429). Try again shortly.";
  return `Brevo returned HTTP ${status}${msg ? `: ${msg}` : ""}.`;
}

async function brevoFetch(path: string, init: RequestInit): Promise<unknown> {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new IntegrationError("Brevo is not configured (BREVO_API_KEY is missing).");
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

export async function brevoTestConnection(): Promise<{ email?: string; companyName?: string }> {
  const body = (await brevoFetch("/account", { method: "GET" })) as { email?: string; companyName?: string };
  return { email: body?.email, companyName: body?.companyName };
}

export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  attachments?: { name: string; contentBase64: string }[];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function textToHtml(text: string): string {
  const paras = text.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`);
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#121733">${paras.join("")}</div>`;
}

export async function brevoSendEmail(msg: EmailMessage): Promise<{ messageId: string | null }> {
  const status = brevoStatus();
  if (!status.configured) throw new IntegrationError(`Brevo is not configured. Missing: ${status.missing.join(", ")}.`);
  const replyTo = process.env.BREVO_REPLY_TO;
  const body = (await brevoFetch("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      sender: { email: status.senderEmail, name: status.senderName ?? undefined },
      to: [{ email: msg.to, name: msg.toName || undefined }],
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      subject: msg.subject,
      textContent: msg.text,
      htmlContent: textToHtml(msg.text),
      ...(msg.attachments?.length ? { attachment: msg.attachments.map((a) => ({ name: a.name, content: a.contentBase64 })) } : {}),
    }),
  })) as { messageId?: string };
  return { messageId: body?.messageId ?? null };
}
