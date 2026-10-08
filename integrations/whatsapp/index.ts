import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, log, NotConfiguredError, simulatedId, type IntegrationResult } from "../core";

export interface WhatsAppTemplateMessage {
  to: string;
  /** Provider-approved template name. */
  template: string;
  language: string;
  variables: string[];
  /** Our own Communication id, echoed back in status webhooks. */
  reference: string;
}

export interface WhatsAppStatusUpdate {
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
  at: string;
  error?: string;
}

/** WhatsApp Business adapters (Meta Cloud API, a BSP, …) implement this. */
export interface WhatsAppProvider {
  key: string;
  label: string;
  configured(): boolean;
  sendTemplate(msg: WhatsAppTemplateMessage): Promise<IntegrationResult>;
  /** Validates the provider's webhook signature. */
  verifyWebhook(rawBody: string, headers: Headers): boolean;
  /** Normalises a provider webhook payload into status updates. */
  parseStatusWebhook(payload: unknown): { eventId: string; updates: WhatsAppStatusUpdate[] };
}

const simulated: WhatsAppProvider = {
  key: "simulated",
  label: "Simulated (no WhatsApp sent)",
  configured: () => true,
  async sendTemplate(msg) {
    log("whatsapp", "simulated template send", { template: msg.template, to: msg.to.slice(0, 5) + "…" });
    return { ok: true, providerRef: simulatedId("wa") };
  },
  verifyWebhook(rawBody, headers) {
    const secret = env("WHATSAPP_WEBHOOK_SECRET") ?? "emc-demo-webhook-secret";
    const given = headers.get("x-emc-signature") ?? "";
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  },
  parseStatusWebhook(payload) {
    const p = payload as { id: string; statuses: WhatsAppStatusUpdate[] };
    return { eventId: p.id, updates: p.statuses ?? [] };
  },
};

function pending(key: string, label: string, envKeys: string[]): WhatsAppProvider {
  return {
    key,
    label,
    configured: () => envKeys.every((k) => !!env(k)),
    async sendTemplate() {
      throw new NotConfiguredError("whatsapp", key);
    },
    verifyWebhook: () => false,
    parseStatusWebhook: () => ({ eventId: "", updates: [] }),
  };
}

const providers: Record<string, WhatsAppProvider> = {
  simulated,
  meta_cloud: pending("meta_cloud", "Meta WhatsApp Cloud API", ["WHATSAPP_META_TOKEN", "WHATSAPP_META_PHONE_NUMBER_ID", "WHATSAPP_WEBHOOK_SECRET"]),
  bsp: pending("bsp", "WhatsApp BSP", ["WHATSAPP_BSP_API_KEY", "WHATSAPP_BSP_BASE_URL", "WHATSAPP_WEBHOOK_SECRET"]),
};

export function whatsappProvider(): WhatsAppProvider {
  return providers[env("WHATSAPP_PROVIDER") ?? "simulated"] ?? simulated;
}
