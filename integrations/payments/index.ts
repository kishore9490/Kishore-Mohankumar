import "server-only";
import { env, NotConfiguredError, type IntegrationResult } from "../core";

export interface PaymentOrder {
  invoiceId: string;
  amount: number;
  currency: "INR";
  customer: { name: string; email: string; phone: string | null };
}

/** Razorpay, Stripe, Cashfree, PayU … implement this. No provider is active until configured. */
export interface PaymentProvider {
  key: string;
  label: string;
  configured(): boolean;
  createOrder(order: PaymentOrder): Promise<IntegrationResult<{ checkoutUrl: string }>>;
  verifyWebhook(rawBody: string, headers: Headers): boolean;
}

const none: PaymentProvider = {
  key: "none",
  label: "Not configured",
  configured: () => false,
  async createOrder() {
    throw new NotConfiguredError("payments", "none");
  },
  verifyWebhook: () => false,
};

const pending = (key: string, label: string, envKeys: string[]): PaymentProvider => ({
  key,
  label,
  configured: () => envKeys.every((k) => !!env(k)),
  async createOrder() {
    throw new NotConfiguredError("payments", key);
  },
  verifyWebhook: () => false,
});

const providers: Record<string, PaymentProvider> = {
  none,
  razorpay: pending("razorpay", "Razorpay", ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"]),
  stripe: pending("stripe", "Stripe", ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]),
};

export function paymentProvider(): PaymentProvider {
  return providers[env("PAYMENT_PROVIDER") ?? "none"] ?? none;
}
