import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

/**
 * AES-256-GCM encryption for secrets stored in the database (integration credentials, TOTP secrets).
 * The key is derived (HKDF-SHA256) from ENCRYPTION_KEY, falling back to SESSION_SECRET.
 * Changing that value makes previously stored secrets unreadable — keep it stable in .env.
 * Format: v1.<iv b64url>.<tag b64url>.<ciphertext b64url>
 */
function key(): Buffer {
  const material = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!material || material.length < 32) throw new Error("ENCRYPTION_KEY or SESSION_SECRET (32+ characters) must be set.");
  return Buffer.from(hkdfSync("sha256", material, "quote-studio", "secret-box-v1", 32));
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ct.toString("base64url")].join(".");
}

export function decryptSecret(box: string): string {
  const [v, iv, tag, ct] = box.split(".");
  if (v !== "v1" || !iv || !tag || ct === undefined) throw new Error("Unsupported secret format.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8");
}

/** Returns null instead of throwing (e.g. after the key was rotated). */
export function tryDecryptSecret(box: string | null | undefined): string | null {
  if (!box) return null;
  try {
    return decryptSecret(box);
  } catch {
    return null;
  }
}

/** "••••••••abcd" — safe to show in the UI. */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  return `${"•".repeat(8)}${value.slice(-4)}`;
}
