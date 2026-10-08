import "server-only";
import { env, log, NotConfiguredError, simulatedId, type IntegrationResult } from "../core";

export interface SmsProvider {
  key: string;
  label: string;
  configured(): boolean;
  send(to: string, text: string, dltTemplateId?: string): Promise<IntegrationResult>;
}

const simulated: SmsProvider = {
  key: "simulated",
  label: "Simulated (no SMS sent)",
  configured: () => true,
  async send(to) {
    log("sms", "simulated send", { to: to.slice(0, 5) + "…" });
    return { ok: true, providerRef: simulatedId("sms") };
  },
};

const pending = (key: string, label: string, envKeys: string[]): SmsProvider => ({
  key,
  label,
  configured: () => envKeys.every((k) => !!env(k)),
  async send() {
    throw new NotConfiguredError("sms", key);
  },
});

const providers: Record<string, SmsProvider> = {
  simulated,
  msg91: pending("msg91", "MSG91", ["MSG91_AUTH_KEY", "SMS_SENDER_ID"]),
  twilio: pending("twilio", "Twilio", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "SMS_SENDER_ID"]),
};

export function smsProvider(): SmsProvider {
  return providers[env("SMS_PROVIDER") ?? "simulated"] ?? simulated;
}
