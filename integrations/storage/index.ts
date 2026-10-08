import "server-only";
import { createHmac } from "node:crypto";
import { env, NotConfiguredError } from "../core";

/**
 * Object storage for PDFs, videos, submissions, certificates and marketing assets.
 * Files never live in PostgreSQL; the database stores only object keys.
 */
export interface StorageProvider {
  key: string;
  label: string;
  configured(): boolean;
  /** Short-lived URL for private objects (course videos, student submissions). */
  signedUrl(objectKey: string, opts: { expiresInSec: number; download?: boolean }): Promise<string>;
  /** URL the browser can upload to directly, after server-side validation. */
  uploadUrl(objectKey: string, contentType: string, maxBytes: number): Promise<string>;
}

/** Demo provider: produces signed URLs to a local route that explains the file is a placeholder. */
const demo: StorageProvider = {
  key: "demo",
  label: "Demo (no files stored)",
  configured: () => true,
  async signedUrl(objectKey, { expiresInSec }) {
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const sig = createHmac("sha256", env("AUTH_SECRET") ?? "emc-demo").update(`${objectKey}:${exp}`).digest("base64url");
    return `/api/files?key=${encodeURIComponent(objectKey)}&exp=${exp}&sig=${sig}`;
  },
  async uploadUrl() {
    throw new NotConfiguredError("storage", "demo");
  },
};

const pending = (key: string, label: string, envKeys: string[]): StorageProvider => ({
  key,
  label,
  configured: () => envKeys.every((k) => !!env(k)),
  async signedUrl() {
    throw new NotConfiguredError("storage", key);
  },
  async uploadUrl() {
    throw new NotConfiguredError("storage", key);
  },
});

const providers: Record<string, StorageProvider> = {
  demo,
  s3: pending("s3", "S3-compatible", ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]),
  r2: pending("r2", "Cloudflare R2", ["R2_BUCKET", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]),
  azure: pending("azure", "Azure Blob", ["AZURE_STORAGE_ACCOUNT", "AZURE_STORAGE_KEY", "AZURE_CONTAINER"]),
};

export function storageProvider(): StorageProvider {
  return providers[env("STORAGE_PROVIDER") ?? "demo"] ?? demo;
}

/** Upload rules enforced server-side before any upload URL is issued. */
export const UPLOAD_RULES = {
  submission: { maxBytes: 20 * 1024 * 1024, types: ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
  lessonResource: { maxBytes: 100 * 1024 * 1024, types: ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"] },
  video: { maxBytes: 4 * 1024 * 1024 * 1024, types: ["video/mp4"] },
} as const;
