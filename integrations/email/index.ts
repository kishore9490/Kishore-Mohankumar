import "server-only";
import { env, log, NotConfiguredError, simulatedId, type IntegrationResult } from "../core";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tags?: string[];
}

/** Every email provider implements this. Business logic depends on the interface only. */
export interface EmailProvider {
  key: string;
  label: string;
  configured(): boolean;
  send(msg: EmailMessage): Promise<IntegrationResult>;
}

/** Development provider: records the message, sends nothing. */
const simulated: EmailProvider = {
  key: "simulated",
  label: "Simulated (no email sent)",
  configured: () => true,
  async send(msg) {
    log("email", "simulated send", { to: msg.to.replace(/(.).+(@.+)/, "$1***$2"), subject: msg.subject });
    return { ok: true, providerRef: simulatedId("email") };
  },
};

/**
 * Adapters for real providers are added here when EMC chooses one.
 * Each reads its own credentials from server env vars (see .env.example).
 */
function pending(key: string, label: string, envKeys: string[]): EmailProvider {
  return {
    key,
    label,
    configured: () => envKeys.every((k) => !!env(k)),
    async send() {
      throw new NotConfiguredError("email", key);
    },
  };
}

const providers: Record<string, EmailProvider> = {
  simulated,
  brevo: pending("brevo", "Brevo", ["BREVO_API_KEY", "EMAIL_FROM"]),
  sendgrid: pending("sendgrid", "SendGrid", ["SENDGRID_API_KEY", "EMAIL_FROM"]),
  ses: pending("ses", "Amazon SES", ["AWS_SES_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "EMAIL_FROM"]),
  msgraph: pending("msgraph", "Microsoft Graph", ["MSGRAPH_TENANT_ID", "MSGRAPH_CLIENT_ID", "MSGRAPH_CLIENT_SECRET", "EMAIL_FROM"]),
  smtp: pending("smtp", "SMTP", ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"]),
};

export function emailProvider(): EmailProvider {
  return providers[env("EMAIL_PROVIDER") ?? "simulated"] ?? simulated;
}
