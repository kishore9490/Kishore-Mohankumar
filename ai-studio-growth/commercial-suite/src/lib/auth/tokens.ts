import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return s;
}

/**
 * Short-lived HMAC token that lets the server-side PDF renderer load a print page
 * for exactly one document. Never sent to browsers.
 */
export function signRenderToken(documentId: string, ttlSeconds = 120): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${documentId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(`render:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyRenderToken(token: string | undefined | null, documentId: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, sig] = parts;
  if (id !== documentId) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", secret()).update(`render:${id}.${expStr}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
