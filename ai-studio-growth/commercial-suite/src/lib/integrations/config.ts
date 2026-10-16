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

type Provider = "app" | "brevo";

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
export const saveApp = (s: Partial<AppSettings>) => save<AppSettings, Record<string, never>>("app", s);
export const saveBrevo = (s: Partial<BrevoSettings>, k?: Partial<BrevoSecrets>) => save<BrevoSettings, BrevoSecrets>("brevo", s, k);

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
