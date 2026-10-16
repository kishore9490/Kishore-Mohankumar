import "server-only";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { encryptSecret, maskSecret, tryDecryptSecret } from "../crypto/secret-box";

/**
 * Integration settings are managed in the app (Settings → Integrations).
 * Non-secret values live in IntegrationConfiguration.settings; credentials live in
 * IntegrationConfiguration.secretsEnc (AES-256-GCM). Secrets are never returned to the browser —
 * the UI only receives masked values.
 */

export interface AppSettings {
  publicUrl?: string;
}

export interface BrevoSettings {
  senderEmail?: string;
  senderName?: string;
  replyTo?: string;
  deliveryMode?: "live" | "mock";
  lastTest?: { at: string; ok: boolean; message: string };
}
export interface BrevoSecrets {
  apiKey?: string;
  webhookToken?: string;
}

export interface WhatsAppTemplateInfo {
  name: string;
  language: string;
  status: string;
  category?: string;
  hasDocumentHeader: boolean;
  bodyParams: number;
}

export type WhatsAppMode = "BUSINESS_APP" | "CLOUD_API";

export interface WhatsAppSettings {
  /** BUSINESS_APP (default): click-to-send from the WhatsApp Business app. CLOUD_API: automated sending via Meta. */
  mode?: WhatsAppMode;
  openWith?: "desktop" | "web" | "phone";
  businessNumber?: string;
  defaultCountryCode?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  apiVersion?: string;
  documentTemplateName?: string;
  reminderTemplateName?: string;
  templateLanguage?: string;
  testTemplateName?: string;
  testTemplateLanguage?: string;
  shareLinkHours?: number;
  templates?: WhatsAppTemplateInfo[];
  templatesLoadedAt?: string;
  lastTest?: { at: string; ok: boolean; message: string; displayPhoneNumber?: string; verifiedName?: string; qualityRating?: string };
}
export interface WhatsAppSecrets {
  accessToken?: string;
  appSecret?: string;
  verifyToken?: string;
}

type Provider = "app" | "brevo" | "whatsapp";

async function load<S, K>(provider: Provider): Promise<{ settings: S; secrets: K }> {
  const row = await prisma.integrationConfiguration.findUnique({ where: { provider } });
  const settings = ((row?.settings as S) ?? {}) as S;
  const raw = tryDecryptSecret(row?.secretsEnc);
  let secrets = {} as K;
  if (raw) {
    try {
      secrets = JSON.parse(raw) as K;
    } catch {
      secrets = {} as K;
    }
  }
  return { settings, secrets };
}

async function save<S extends object, K extends object>(provider: Provider, settingsPatch: Partial<S>, secretsPatch?: Partial<K>) {
  const current = await load<S, K>(provider);
  const settings = { ...current.settings, ...settingsPatch };
  const data: Prisma.IntegrationConfigurationUncheckedUpdateInput = { settings: settings as Prisma.InputJsonValue };
  if (secretsPatch) {
    const merged = { ...current.secrets } as Record<string, unknown>;
    for (const [k, v] of Object.entries(secretsPatch)) {
      if (v === null || v === "") delete merged[k];
      else if (v !== undefined) merged[k] = v;
    }
    data.secretsEnc = Object.keys(merged).length ? encryptSecret(JSON.stringify(merged)) : null;
  }
  await prisma.integrationConfiguration.upsert({
    where: { provider },
    create: { provider, settings: settings as Prisma.InputJsonValue, secretsEnc: (data.secretsEnc as string | null | undefined) ?? null },
    update: data,
  });
}

export const loadApp = () => load<AppSettings, Record<string, never>>("app");
export const loadBrevo = () => load<BrevoSettings, BrevoSecrets>("brevo");
export const loadWhatsApp = () => load<WhatsAppSettings, WhatsAppSecrets>("whatsapp");
export const saveApp = (s: Partial<AppSettings>) => save<AppSettings, Record<string, never>>("app", s);
export const saveBrevo = (s: Partial<BrevoSettings>, k?: Partial<BrevoSecrets>) => save<BrevoSettings, BrevoSecrets>("brevo", s, k);
export const saveWhatsApp = (s: Partial<WhatsAppSettings>, k?: Partial<WhatsAppSecrets>) => save<WhatsAppSettings, WhatsAppSecrets>("whatsapp", s, k);

function validPublicUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return null;
    return url.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Public base URL reachable from the internet (needed for webhooks and customer links). Never localhost. */
export async function publicAppUrl(): Promise<string | null> {
  const { settings } = await loadApp();
  const url = validPublicUrl(settings.publicUrl) ?? validPublicUrl(process.env.PUBLIC_APP_URL);
  if (!url) return null;
  const host = new URL(url).hostname;
  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(host)) return null;
  return url;
}

/** Base URL for links shown to staff (invitations): public URL if set, otherwise the current request's host. */
export async function appBaseUrl(): Promise<string> {
  const { settings } = await loadApp();
  const configured = validPublicUrl(settings.publicUrl) ?? validPublicUrl(process.env.PUBLIC_APP_URL);
  if (configured) return configured;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) return `${h.get("x-forwarded-proto") ?? "http"}://${host}`;
  } catch {
    /* not in a request */
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

// ───────── Status (safe to show in UI) ─────────

export interface BrevoStatus {
  configured: boolean;
  mode: "live" | "mock";
  senderEmail: string | null;
  senderName: string | null;
  replyTo: string | null;
  apiKeyMasked: string | null;
  missing: string[];
  webhookTokenSet: boolean;
  lastTest?: BrevoSettings["lastTest"];
}

export async function brevoStatus(): Promise<BrevoStatus> {
  const { settings, secrets } = await loadBrevo();
  const missing: string[] = [];
  if (!secrets.apiKey) missing.push("API key");
  if (!settings.senderEmail) missing.push("sender email");
  return {
    configured: missing.length === 0,
    mode: settings.deliveryMode === "mock" && process.env.NODE_ENV !== "production" ? "mock" : "live",
    senderEmail: settings.senderEmail ?? null,
    senderName: settings.senderName ?? null,
    replyTo: settings.replyTo ?? null,
    apiKeyMasked: maskSecret(secrets.apiKey),
    missing,
    webhookTokenSet: !!secrets.webhookToken,
    lastTest: settings.lastTest,
  };
}

export interface WhatsAppStatus {
  mode: WhatsAppMode;
  /** Cloud API mode selected AND credentials present — documents are sent automatically. */
  apiActive: boolean;
  configured: boolean;
  missing: string[];
  apiVersion: string;
  phoneNumberId: string | null;
  businessAccountId: string | null;
  accessTokenMasked: string | null;
  appSecretSet: boolean;
  verifyTokenSet: boolean;
  webhookConfigured: boolean;
  settings: Omit<WhatsAppSettings, never>;
}

export const DEFAULT_WA_API_VERSION = "v21.0";

export async function whatsappStatus(): Promise<WhatsAppStatus> {
  const { settings, secrets } = await loadWhatsApp();
  const missing: string[] = [];
  if (!secrets.accessToken) missing.push("access token");
  if (!settings.phoneNumberId) missing.push("phone number ID");
  const mode: WhatsAppMode = settings.mode === "CLOUD_API" ? "CLOUD_API" : "BUSINESS_APP";
  return {
    mode,
    apiActive: mode === "CLOUD_API" && missing.length === 0,
    configured: missing.length === 0,
    missing,
    apiVersion: settings.apiVersion || DEFAULT_WA_API_VERSION,
    phoneNumberId: settings.phoneNumberId ?? null,
    businessAccountId: settings.businessAccountId ?? null,
    accessTokenMasked: maskSecret(secrets.accessToken),
    appSecretSet: !!secrets.appSecret,
    verifyTokenSet: !!secrets.verifyToken,
    webhookConfigured: !!secrets.appSecret && !!secrets.verifyToken,
    settings,
  };
}
