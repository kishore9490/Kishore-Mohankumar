import "server-only";

/**
 * Shared integration plumbing: every adapter returns an IntegrationResult and
 * throws ProviderError only for retryable failures. Business logic never sees
 * provider SDKs or credentials.
 */
export type IntegrationResult<T = undefined> =
  | { ok: true; providerRef: string | null; data?: T }
  | { ok: false; error: string; retryable: boolean };

export class NotConfiguredError extends Error {
  constructor(public integration: string, public provider: string) {
    super(`${integration} provider "${provider}" is not configured. Add its credentials on the server and enable it.`);
  }
}

export function log(integration: string, message: string, meta: Record<string, unknown> = {}) {
  // Swap for a structured logger (pino, OpenTelemetry) in production. Never log secrets or message bodies.
  console.info(`[integration:${integration}] ${message}`, meta);
}

/** Exponential backoff retry for transient provider errors. */
export async function withRetry<T>(fn: () => Promise<IntegrationResult<T>>, attempts = 3, baseMs = 300): Promise<IntegrationResult<T>> {
  let last: IntegrationResult<T> = { ok: false, error: "not attempted", retryable: false };
  for (let i = 0; i < attempts; i++) {
    try {
      last = await fn();
    } catch (e) {
      last = { ok: false, error: e instanceof Error ? e.message : String(e), retryable: !(e instanceof NotConfiguredError) };
    }
    if (last.ok || !last.retryable) return last;
    await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
  }
  return last;
}

/** Reads a server-only env var. Values are never sent to the browser. */
export function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export const simulatedId = (p: string) => `sim_${p}_${Math.random().toString(36).slice(2, 10)}`;
