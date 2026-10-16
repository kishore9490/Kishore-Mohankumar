import { describe, expect, it } from "vitest";
import { base32Decode, base32Encode, generateRecoveryCodes, generateTotpSecret, hotp, normalizeRecoveryCode, otpauthUrl, totpAt, verifyTotp } from "@/lib/auth/totp";
import { decryptSecret, encryptSecret, maskSecret, tryDecryptSecret } from "@/lib/crypto/secret-box";
import { buildChatUrl, normalizeWhatsAppNumber } from "@/lib/integrations/phone";
import { mapBrevoEvent } from "@/lib/integrations/brevo";
import { extractInboundMessages } from "@/lib/integrations/whatsapp";

process.env.SESSION_SECRET = process.env.SESSION_SECRET || "x".repeat(40);

describe("TOTP (RFC 6238)", () => {
  // RFC 6238 Appendix B test secret (ASCII "12345678901234567890"), SHA-1, 8 digits
  const rfcSecret = Buffer.from("12345678901234567890");
  it("matches the RFC test vectors", () => {
    expect(hotp(rfcSecret, Math.floor(59 / 30), 8)).toBe("94287082");
    expect(hotp(rfcSecret, Math.floor(1111111109 / 30), 8)).toBe("07081804");
    expect(hotp(rfcSecret, Math.floor(1234567890 / 30), 8)).toBe("89005924");
    expect(hotp(rfcSecret, Math.floor(20000000000 / 30), 8)).toBe("65353130");
  });
  it("round-trips base32", () => {
    const b = Buffer.from("hello world, quote studio");
    expect(base32Decode(base32Encode(b)).toString()).toBe("hello world, quote studio");
    expect(base32Encode(rfcSecret)).toBe("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  });
  it("accepts current and adjacent codes and rejects replays", () => {
    const secret = generateTotpSecret();
    const now = Date.UTC(2026, 9, 16, 10, 0, 15);
    const code = totpAt(secret, now);
    const step = verifyTotp(secret, code, null, now);
    expect(step).not.toBeNull();
    expect(verifyTotp(secret, code, step, now)).toBeNull(); // replay blocked
    expect(verifyTotp(secret, totpAt(secret, now - 30_000), null, now)).not.toBeNull(); // 1 step drift ok
    expect(verifyTotp(secret, totpAt(secret, now - 90_000), null, now)).toBeNull(); // too old
    expect(verifyTotp(secret, "12345", null, now)).toBeNull();
    expect(verifyTotp(secret, "abcdef", null, now)).toBeNull();
  });
  it("builds otpauth URLs and recovery codes", () => {
    expect(otpauthUrl("ABC", "a@b.co")).toBe("otpauth://totp/AI%20Studio%20Quote%20Studio%3Aa%40b.co?secret=ABC&issuer=AI%20Studio%20Quote%20Studio&algorithm=SHA1&digits=6&period=30");
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8);
    expect(codes[0]).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(normalizeRecoveryCode(" ab12-cd34 ")).toBe("AB12CD34");
  });
});

describe("secret box (AES-256-GCM)", () => {
  it("encrypts, decrypts and detects tampering", () => {
    const box = encryptSecret("xkeysib-secret-value");
    expect(box).not.toContain("secret-value");
    expect(decryptSecret(box)).toBe("xkeysib-secret-value");
    expect(encryptSecret("same")).not.toBe(encryptSecret("same")); // random IV
    const tampered = box.slice(0, -2) + (box.endsWith("A") ? "BB" : "AA");
    expect(tryDecryptSecret(tampered)).toBeNull();
    expect(maskSecret("abcdefgh1234")).toBe("••••••••1234");
  });
});

describe("WhatsApp Business click-to-send", () => {
  it("normalises numbers with a default country code", () => {
    expect(normalizeWhatsAppNumber("98765 43210")).toBe("919876543210");
    expect(normalizeWhatsAppNumber("98765 43210", "971")).toBe("9719876543210");
    expect(normalizeWhatsAppNumber("+1 (415) 555-0100")).toBe("14155550100");
  });
  it("builds links for desktop app, web and phone", () => {
    expect(buildChatUrl("919876543210", "Hi & bye", "desktop")).toBe("whatsapp://send?phone=919876543210&text=Hi%20%26%20bye");
    expect(buildChatUrl("919876543210", "Hi", "web")).toBe("https://web.whatsapp.com/send?phone=919876543210&text=Hi");
    expect(buildChatUrl("919876543210", "Hi", "phone")).toBe("https://wa.me/919876543210?text=Hi");
  });
  it("extracts inbound messages for the 24-hour window", () => {
    expect(extractInboundMessages({ entry: [{ changes: [{ value: { messages: [{ from: "919876543210", timestamp: "1700000000" }] } }] }] })).toEqual([{ from: "919876543210", timestamp: "1700000000" }]);
  });
});

describe("Brevo webhook events", () => {
  it("maps events to delivery statuses", () => {
    expect(mapBrevoEvent("delivered")).toBe("DELIVERED");
    expect(mapBrevoEvent("unique_opened")).toBe("READ");
    expect(mapBrevoEvent("hard_bounce")).toBe("FAILED");
    expect(mapBrevoEvent("request")).toBeNull();
    expect(mapBrevoEvent("soft_bounce")).toBeNull();
  });
});
