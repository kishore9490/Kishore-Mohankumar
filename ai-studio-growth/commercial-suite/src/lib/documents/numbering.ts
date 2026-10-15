import type { DocumentType } from "./meta";
import { DOCUMENT_TYPE_META } from "./meta";
import { financialYearLabel } from "../dates";
import type { Tx } from "../prisma";

export interface SequenceConfig {
  prefix: string;
  padding: number;
  includeFinancialYear: boolean;
}

/** e.g. { prefix: "INV", padding: 4, includeFinancialYear: true }, 7, 2026-10-15 → "INV/2026-27/0007" */
export function formatDocumentNumber(config: SequenceConfig, n: number, issueDateIso: string): string {
  const seq = String(n).padStart(Math.max(1, Math.min(config.padding, 10)), "0");
  const parts = [config.prefix.trim()];
  if (config.includeFinancialYear) parts.push(financialYearLabel(issueDateIso));
  parts.push(seq);
  return parts.filter(Boolean).join("/");
}

/**
 * Allocates the next number for a company + document type.
 * Must be called inside a database transaction: the atomic increment takes a row lock on the
 * sequence, so concurrent allocations are serialised. The unique index on
 * (companyId, type, number) is the final guard — if a manually adjusted counter collides with an
 * existing number we skip forward rather than issuing a duplicate.
 */
export async function allocateDocumentNumber(tx: Tx, companyId: string, type: DocumentType, issueDateIso: string): Promise<string> {
  await tx.documentSequence.upsert({
    where: { companyId_type: { companyId, type } },
    create: { companyId, type, prefix: DOCUMENT_TYPE_META[type].defaultPrefix, nextNumber: 1, padding: 4, includeFinancialYear: true },
    update: {},
  });
  for (let attempt = 0; attempt < 50; attempt++) {
    const seq = await tx.documentSequence.update({
      where: { companyId_type: { companyId, type } },
      data: { nextNumber: { increment: 1 } },
    });
    const number = formatDocumentNumber(seq, seq.nextNumber - 1, issueDateIso);
    const clash = await tx.document.findFirst({ where: { companyId, type, number }, select: { id: true } });
    if (!clash) return number;
  }
  throw new Error("Could not allocate a unique document number. Check the numbering settings.");
}
