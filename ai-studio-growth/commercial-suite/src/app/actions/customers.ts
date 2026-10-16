"use server";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { customerSchema, type CustomerInput } from "@/lib/validation/schemas";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";

export async function saveCustomerAction(id: string | null, input: CustomerInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertUser();
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    const data = {
      ...parsed.data,
      contactPerson: parsed.data.contactPerson ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      billingAddress: parsed.data.billingAddress ?? null,
      shippingAddress: parsed.data.shippingAddress ?? null,
      gstin: parsed.data.gstin ?? null,
      state: parsed.data.state ?? null,
      stateCode: parsed.data.stateCode ?? null,
      notes: parsed.data.notes ?? null,
    };
    if (data.preferredChannel === "WHATSAPP" && !data.phone) return { ok: false, error: "A phone number is required when WhatsApp is the preferred channel.", fieldErrors: { phone: ["Required for WhatsApp"] } };
    const saved = id ? await prisma.customer.update({ where: { id }, data }) : await prisma.customer.create({ data });
    return { ok: true, data: { id: saved.id }, message: id ? "Customer updated" : "Customer created" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setCustomerArchivedAction(id: string, archived: boolean): Promise<ActionResult> {
  try {
    await assertUser();
    await prisma.customer.update({ where: { id }, data: { archived } });
    return { ok: true, message: archived ? "Customer archived" : "Customer restored" };
  } catch (e) {
    return toActionError(e);
  }
}

/** Permanently deletes a customer only when no documents reference it; otherwise archive instead. */
export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const count = await prisma.document.count({ where: { customerId: id } });
    if (count > 0) throw new ServiceError(`This customer has ${count} document(s). Archive the customer instead to keep the history intact.`);
    await prisma.customer.delete({ where: { id } });
    return { ok: true, message: "Customer deleted" };
  } catch (e) {
    return toActionError(e);
  }
}
