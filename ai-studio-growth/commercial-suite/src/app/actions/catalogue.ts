"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { productSchema, type ProductInput } from "@/lib/validation/schemas";
import { toActionError, type ActionResult } from "@/lib/services/errors";

export async function saveProductAction(id: string | null, input: ProductInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertUser();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    const d = parsed.data;
    if (d.sku) {
      const clash = await prisma.productService.findFirst({ where: { sku: d.sku, ...(id ? { NOT: { id } } : {}) } });
      if (clash) return { ok: false, error: "Another item already uses this SKU.", fieldErrors: { sku: ["SKU must be unique"] } };
    }
    const data = { ...d, sku: d.sku ?? null, hsnSac: d.hsnSac ?? null, shortDescription: d.shortDescription ?? null, detailedDescription: d.detailedDescription ?? null };
    const saved = id ? await prisma.productService.update({ where: { id }, data }) : await prisma.productService.create({ data });
    revalidatePath("/catalogue");
    return { ok: true, data: { id: saved.id }, message: id ? "Item updated" : "Item created" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setProductActiveAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await assertUser();
    await prisma.productService.update({ where: { id }, data: { active } });
    revalidatePath("/catalogue");
    return { ok: true, message: active ? "Item activated" : "Item deactivated" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const used = await prisma.documentLineItem.count({ where: { productServiceId: id } });
    if (used > 0) return { ok: false, error: `This item is used on ${used} document line(s). Deactivate it instead.` };
    await prisma.productService.delete({ where: { id } });
    revalidatePath("/catalogue");
    return { ok: true, message: "Item deleted" };
  } catch (e) {
    return toActionError(e);
  }
}
