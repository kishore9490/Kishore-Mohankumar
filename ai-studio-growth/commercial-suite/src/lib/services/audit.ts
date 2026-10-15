import type { Tx } from "../prisma";

export async function audit(db: Tx, input: { documentId?: string | null; userId?: string | null; action: string; summary: string }) {
  await db.auditEvent.create({
    data: { documentId: input.documentId ?? null, userId: input.userId ?? null, action: input.action, summary: input.summary.slice(0, 500) },
  });
}
