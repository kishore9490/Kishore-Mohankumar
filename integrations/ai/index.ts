import "server-only";
import { env, NotConfiguredError, type IntegrationResult } from "../core";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletion {
  text: string;
  model: string;
  tokens: number | null;
}

/** OpenAI, Gemini, Anthropic or any other model provider implements this. */
export interface AIProvider {
  key: string;
  label: string;
  configured(): boolean;
  complete(messages: AIMessage[], opts: { maxTokens: number; temperature?: number }): Promise<IntegrationResult<AICompletion>>;
}

const none: AIProvider = {
  key: "none",
  label: "Not configured",
  configured: () => false,
  async complete() {
    throw new NotConfiguredError("ai", "none");
  },
};

const pending = (key: string, label: string, envKeys: string[]): AIProvider => ({
  key,
  label,
  configured: () => envKeys.every((k) => !!env(k)),
  async complete() {
    throw new NotConfiguredError("ai", key);
  },
});

const providers: Record<string, AIProvider> = {
  none,
  openai: pending("openai", "OpenAI", ["OPENAI_API_KEY", "AI_MODEL"]),
  gemini: pending("gemini", "Google Gemini", ["GEMINI_API_KEY", "AI_MODEL"]),
  anthropic: pending("anthropic", "Anthropic", ["ANTHROPIC_API_KEY", "AI_MODEL"]),
};

export function aiProvider(): AIProvider {
  return providers[env("AI_PROVIDER") ?? "none"] ?? none;
}
