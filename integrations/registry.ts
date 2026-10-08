import "server-only";
import type { IntegrationStatus } from "@/lib/platform/types";
import { db } from "@/server/db/store";
import { emailProvider } from "./email";
import { whatsappProvider } from "./whatsapp";
import { smsProvider } from "./sms";
import { aiProvider } from "./ai";
import { storageProvider } from "./storage";
import { paymentProvider } from "./payments";
import { analyticsProvider } from "./analytics";

/** Status of every integration, safe to show to Super Admin. Contains no secrets. */
export function integrationStatuses(): IntegrationStatus[] {
  const comms = db().communications;
  const last = (channel: string) => comms.filter((c) => c.channel === channel && c.status !== "failed").map((c) => c.createdAt).sort().at(-1) ?? null;
  const lastErr = (channel: string) => comms.filter((c) => c.channel === channel && c.status === "failed").at(-1)?.error ?? null;
  const row = (key: string, category: IntegrationStatus["category"], label: string, p: { key: string; label: string; configured(): boolean }, lastSuccessAt: string | null = null, lastError: string | null = null): IntegrationStatus => ({
    key, category, label, provider: p.label, configured: p.configured(),
    status: ["simulated", "demo", "internal"].includes(p.key) ? "simulated" : p.configured() ? (lastError ? "error" : "connected") : "not_configured",
    lastSuccessAt, lastError,
  });
  return [
    row("email", "communication", "Email", emailProvider(), last("email"), lastErr("email")),
    row("whatsapp", "communication", "WhatsApp Business", whatsappProvider(), last("whatsapp"), lastErr("whatsapp")),
    row("sms", "communication", "SMS", smsProvider(), last("sms"), lastErr("sms")),
    row("ai", "ai", "AI models", aiProvider()),
    row("payments", "payments", "Payment gateway", paymentProvider()),
    row("storage", "storage", "File storage", storageProvider()),
    row("analytics", "analytics", "Analytics", analyticsProvider()),
    { key: "auth", category: "authentication", label: "Sign-in", provider: "Email + password (built-in)", configured: true, status: "connected", lastSuccessAt: db().users.map((u) => u.lastLoginAt ?? "").sort().at(-1) ?? null, lastError: null },
  ];
}
