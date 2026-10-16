"use server";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { documentSchema, paymentSchema, type DocumentInput, type PaymentInput } from "@/lib/validation/schemas";
import { toActionError, type ActionResult } from "@/lib/services/errors";
import {
  convertDocument, deleteDraft, deletePayment, duplicateDocument, issueInvoice, recordPayment, saveDocument, setDocumentStatus,
} from "@/lib/services/documents";
import { DOCUMENT_TYPE_META, type DocumentStatus, type DocumentType } from "@/lib/documents/meta";

function revalidateDocs() {
}

export async function saveDocumentAction(id: string | null, input: DocumentInput): Promise<ActionResult<{ id: string; path: string }>> {
  try {
    const user = await assertUser();
    const parsed = documentSchema.safeParse(input);
    if (!parsed.success) {
      const flat: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        (flat[key] ??= []).push(issue.message);
      }
      return { ok: false, error: `Please fix ${parsed.error.issues.length} problem(s): ${parsed.error.issues[0].message}`, fieldErrors: flat };
    }
    const docId = await saveDocument(prisma, parsed.data, user.id, id ?? undefined);
    revalidateDocs();
    return { ok: true, data: { id: docId, path: `/documents/${DOCUMENT_TYPE_META[parsed.data.type].slug}/${docId}` }, message: id ? "Changes saved" : "Draft saved" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function issueInvoiceAction(id: string): Promise<ActionResult<{ number: string }>> {
  try {
    const user = await assertUser();
    const number = await issueInvoice(prisma, id, user.id);
    revalidateDocs();
    return { ok: true, data: { number }, message: `Invoice ${number} issued` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setStatusAction(id: string, status: DocumentStatus): Promise<ActionResult> {
  try {
    const user = await assertUser();
    await setDocumentStatus(prisma, id, status, user.id);
    revalidateDocs();
    return { ok: true, message: `Marked as ${status.toLowerCase().replace("_", " ")}` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function convertDocumentAction(id: string, target: DocumentType): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await assertUser();
    const newId = await convertDocument(prisma, id, target, user.id);
    revalidateDocs();
    return { ok: true, data: { id: newId }, message: `${DOCUMENT_TYPE_META[target].label} draft created` };
  } catch (e) {
    return toActionError(e);
  }
}

export async function duplicateDocumentAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await assertUser();
    const newId = await duplicateDocument(prisma, id, user.id);
    revalidateDocs();
    return { ok: true, data: { id: newId }, message: "Duplicate created as a new draft" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteDraftAction(id: string): Promise<ActionResult> {
  try {
    const user = await assertUser();
    await deleteDraft(prisma, id, user.id);
    revalidateDocs();
    return { ok: true, message: "Draft deleted" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function recordPaymentAction(input: PaymentInput): Promise<ActionResult> {
  try {
    const user = await assertUser();
    const parsed = paymentSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    await recordPayment(prisma, parsed.data, user.id);
    revalidateDocs();
    return { ok: true, message: "Payment recorded" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deletePaymentAction(paymentId: string): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    await deletePayment(prisma, paymentId, user.id);
    revalidateDocs();
    return { ok: true, message: "Payment removed" };
  } catch (e) {
    return toActionError(e);
  }
}
