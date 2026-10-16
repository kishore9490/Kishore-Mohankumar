/** Shared (client-safe) WhatsApp helpers. */

/** Digits-only international format with country code. 10-digit numbers get the default country code (India: 91). */
export function normalizeWhatsAppNumber(input: string, defaultCountryCode = "91"): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `${defaultCountryCode}${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

export type OpenWith = "desktop" | "web" | "phone";

/**
 * Click-to-chat link that opens the WhatsApp Business app with the message prefilled.
 *   desktop → whatsapp:// protocol (WhatsApp / WhatsApp Business desktop app on Windows/macOS)
 *   web     → WhatsApp Web in the browser
 *   phone   → wa.me universal link (opens the app on phones, offers desktop/web on computers)
 */
export function buildChatUrl(number: string, text: string, openWith: OpenWith = "phone"): string {
  const t = encodeURIComponent(text);
  if (openWith === "desktop") return `whatsapp://send?phone=${number}&text=${t}`;
  if (openWith === "web") return `https://web.whatsapp.com/send?phone=${number}&text=${t}`;
  return `https://wa.me/${number}?text=${t}`;
}

export const OPEN_WITH_LABEL: Record<OpenWith, string> = {
  desktop: "WhatsApp Business desktop app",
  web: "WhatsApp Web (browser)",
  phone: "wa.me link (phone / any device)",
};
