"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { companySchema, passwordField, sequenceSchema, userSchema, type CompanyInput } from "@/lib/validation/schemas";
import { ServiceError, toActionError, type ActionResult } from "@/lib/services/errors";
import { clearSampleData, seedSampleData } from "@/lib/sample-data";
import { audit } from "@/lib/services/audit";

export async function saveCompanyAction(id: string | null, input: CompanyInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await assertUser("ADMIN");
    const parsed = companySchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    const d = parsed.data;
    const nullable = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v === undefined ? null : v])) as typeof d;
    const saved = await prisma.$transaction(async (tx) => {
      if (d.isDefault) await tx.companyProfile.updateMany({ where: id ? { NOT: { id } } : {}, data: { isDefault: false } });
      const row = id ? await tx.companyProfile.update({ where: { id }, data: nullable }) : await tx.companyProfile.create({ data: nullable });
      if (!id) {
        for (const [type, prefix] of [["PROPOSAL", "PRP"], ["QUOTATION", "QT"], ["INVOICE", "INV"], ["PROFORMA", "PI"]] as const)
          await tx.documentSequence.create({ data: { companyId: row.id, type, prefix, nextNumber: 1, padding: 4, includeFinancialYear: true } });
      }
      const anyDefault = await tx.companyProfile.count({ where: { isDefault: true } });
      if (!anyDefault) await tx.companyProfile.update({ where: { id: row.id }, data: { isDefault: true } });
      return row;
    });
    await audit(prisma, { userId: user.id, action: "company.saved", summary: `Company profile ${saved.brandName} ${id ? "updated" : "created"}` });
    revalidatePath("/", "layout");
    return { ok: true, data: { id: saved.id }, message: "Company settings saved" };
  } catch (e) {
    return toActionError(e);
  }
}

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadLogoAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    const companyId = String(formData.get("companyId") ?? "");
    const slot = formData.get("slot") === "secondary" ? "secondary" : "primary";
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new ServiceError("Choose an image file to upload.");
    if (!LOGO_TYPES.includes(file.type)) throw new ServiceError("Logos must be PNG, JPEG or WebP images.");
    if (file.size > 1_000_000) throw new ServiceError("Logo files must be smaller than 1 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    // Verify magic bytes rather than trusting the declared type
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    if (!isPng && !isJpeg && !isWebp) throw new ServiceError("The file does not look like a valid PNG, JPEG or WebP image.");
    const mime = isPng ? "image/png" : isJpeg ? "image/jpeg" : "image/webp";
    await prisma.companyProfile.update({
      where: { id: companyId },
      data: slot === "primary" ? { logoPrimary: bytes, logoPrimaryMime: mime } : { logoSecondary: bytes, logoSecondaryMime: mime },
    });
    revalidatePath("/settings/company");
    return { ok: true, message: "Logo uploaded" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function removeLogoAction(companyId: string, slot: "primary" | "secondary"): Promise<ActionResult> {
  try {
    await assertUser("ADMIN");
    await prisma.companyProfile.update({
      where: { id: companyId },
      data: slot === "primary" ? { logoPrimary: null, logoPrimaryMime: null } : { logoSecondary: null, logoSecondaryMime: null },
    });
    revalidatePath("/settings/company");
    return { ok: true, message: "Logo removed — a typographic brand treatment will be used." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function saveSequenceAction(id: string, input: z.input<typeof sequenceSchema>): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    const d = sequenceSchema.parse(input);
    const seq = await prisma.documentSequence.update({ where: { id }, data: d });
    await audit(prisma, { userId: user.id, action: "numbering.updated", summary: `${seq.type} numbering set to prefix ${d.prefix}, next ${d.nextNumber}` });
    revalidatePath("/settings/company");
    return { ok: true, message: "Numbering updated. Existing numbers are never reused — clashes are skipped automatically." };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

export async function resetSampleDataAction(): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    await seedSampleData(prisma, user.id);
    await audit(prisma, { userId: user.id, action: "samples.reset", summary: "Sample data reset" });
    revalidatePath("/", "layout");
    return { ok: true, message: "Sample data has been reset." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function clearSampleDataAction(): Promise<ActionResult> {
  try {
    const user = await assertUser("ADMIN");
    await clearSampleData(prisma);
    await audit(prisma, { userId: user.id, action: "samples.cleared", summary: "Sample data removed" });
    revalidatePath("/", "layout");
    return { ok: true, message: "All sample records removed." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function createUserAction(input: z.input<typeof userSchema>): Promise<ActionResult> {
  try {
    const admin = await assertUser("ADMIN");
    const parsed = userSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return { ok: false, error: "A user with this email already exists." };
    await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: await hashPassword(parsed.data.password) } });
    await audit(prisma, { userId: admin.id, action: "user.created", summary: `User ${parsed.data.email} created (${parsed.data.role.toLowerCase()})` });
    revalidatePath("/settings/users");
    return { ok: true, message: "User created. Share the temporary password securely." };
  } catch (e) {
    return toActionError(e);
  }
}

export async function setUserActiveAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    const admin = await assertUser("ADMIN");
    if (id === admin.id) throw new ServiceError("You cannot deactivate your own account.");
    if (!active) {
      const target = await prisma.user.findUniqueOrThrow({ where: { id } });
      if (target.role === "ADMIN" && (await prisma.user.count({ where: { role: "ADMIN", active: true } })) <= 1) throw new ServiceError("At least one active administrator is required.");
    }
    await prisma.user.update({ where: { id }, data: { active } });
    if (!active) await prisma.session.deleteMany({ where: { userId: id } });
    revalidatePath("/settings/users");
    return { ok: true, message: active ? "User reactivated" : "User deactivated and signed out" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function adminResetPasswordAction(id: string, password: string): Promise<ActionResult> {
  try {
    const admin = await assertUser("ADMIN");
    const pw = passwordField.parse(password);
    await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(pw) } });
    await prisma.session.deleteMany({ where: { userId: id } });
    await audit(prisma, { userId: admin.id, action: "user.password_reset", summary: "Password reset by administrator" });
    return { ok: true, message: "Password reset. The user has been signed out of all sessions." };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

export async function changeOwnPasswordAction(current: string, next: string): Promise<ActionResult> {
  try {
    const me = await assertUser();
    const pw = passwordField.parse(next);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!(await verifyPassword(current, user.passwordHash))) throw new ServiceError("Your current password is incorrect.");
    await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(pw) } });
    return { ok: true, message: "Password changed" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}
