import "server-only";
import { prisma } from "../prisma";
import { randomToken, sha256 } from "../auth/tokens";
import { publicAppUrl } from "./config";

export { publicAppUrl };

/**
 * Creates a short-lived, single-document link. Only the SHA-256 hash of the token is stored;
 * links expire, have an access cap and can be revoked. There is no public directory of documents.
 */
export async function createShareLink(documentId: string, hours = 72, maxAccess = 20): Promise<string | null> {
  const base = await publicAppUrl();
  if (!base) return null;
  const token = randomToken(24);
  await prisma.documentShareLink.create({
    data: { documentId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + Math.min(Math.max(hours, 1), 24 * 14) * 3_600_000), maxAccess },
  });
  return `${base}/share/${token}`;
}

export async function consumeShareLink(token: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const link = await prisma.documentShareLink.findUnique({ where: { tokenHash: sha256(token) } });
  if (!link || link.revokedAt || link.expiresAt < new Date() || link.accessCount >= link.maxAccess) return null;
  await prisma.documentShareLink.update({ where: { id: link.id }, data: { accessCount: { increment: 1 } } });
  return link.documentId;
}
