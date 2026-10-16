"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createInvitation, inviteUser, regenerateRecoveryCodes, resetAccess, revokeInvitations, verifyCurrentUserCode } from "@/lib/auth/accounts";
import { sendInviteEmail } from "@/lib/auth/invite-email";
import { appBaseUrl } from "@/lib/integrations/config";
import { companySchema, passwordField, sequenceSchema, type CompanyInput } from "@/lib/validation/schemas";
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

const inviteSchema = z.object({ name: z.string().trim().min(2, "Enter the person’s name").max(120), email: z.string().trim().toLowerCase().email("Enter a valid email address"), role: z.enum(["ADMIN", "STAFF"]) });

export type InviteResult = ActionResult<{ url: string; emailed: boolean; emailNote?: string }>;

/** Invite-only onboarding: creates the account without a password and returns a single-use link. */
export async function inviteUserAction(input: z.input<typeof inviteSchema>): Promise<InviteResult> {
  try {
    const admin = await assertUser("ADMIN");
    const d = inviteSchema.parse(input);
    const { token } = await inviteUser(prisma, d, admin.id);
    const url = `${await appBaseUrl()}/invite/${token}`;
    const mail = await sendInviteEmail(d.email, d.name, url, "invite", admin.name);
    await audit(prisma, { userId: admin.id, action: "user.invited", summary: `${d.email} invited as ${d.role.toLowerCase()}${mail.sent ? " (email sent)" : ""}` });
    revalidatePath("/settings/users");
    return { ok: true, data: { url, emailed: mail.sent, emailNote: mail.reason }, message: mail.sent ? `Invitation emailed to ${d.email}` : "Invitation created" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

/** New link for someone who has not accepted yet (previous links stop working). */
export async function reissueInviteAction(userId: string): Promise<InviteResult> {
  try {
    const admin = await assertUser("ADMIN");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.passwordHash) throw new ServiceError("This user has already accepted. Use “Reset access” instead.");
    const token = await createInvitation(prisma, userId, admin.id);
    const url = `${await appBaseUrl()}/invite/${token}`;
    const mail = await sendInviteEmail(user.email, user.name, url, "invite", admin.name);
    await audit(prisma, { userId: admin.id, action: "user.invited", summary: `Invitation re-issued to ${user.email}` });
    revalidatePath("/settings/users");
    return { ok: true, data: { url, emailed: mail.sent, emailNote: mail.reason }, message: "New invitation link created" };
  } catch (e) {
    return toActionError(e);
  }
}

/** Revokes password, MFA and sessions; the user regains access only via the new link. */
export async function resetAccessAction(userId: string): Promise<InviteResult> {
  try {
    const admin = await assertUser("ADMIN");
    if (userId === admin.id) throw new ServiceError("You cannot reset your own access. Ask another administrator.");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const token = await resetAccess(prisma, userId, admin.id);
    const url = `${await appBaseUrl()}/invite/${token}`;
    const mail = await sendInviteEmail(user.email, user.name, url, "reset", admin.name);
    await audit(prisma, { userId: admin.id, action: "user.access_reset", summary: `Access reset for ${user.email} (password, MFA and sessions revoked)` });
    revalidatePath("/settings/users");
    return { ok: true, data: { url, emailed: mail.sent, emailNote: mail.reason }, message: "Access reset — the user must use the new link" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function revokeInviteAction(userId: string): Promise<ActionResult> {
  try {
    const admin = await assertUser("ADMIN");
    await revokeInvitations(prisma, userId);
    await audit(prisma, { userId: admin.id, action: "user.invite_revoked", summary: "Invitation revoked" });
    revalidatePath("/settings/users");
    return { ok: true, message: "Invitation revoked" };
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
      if (target.role === "ADMIN" && (await prisma.user.count({ where: { role: "ADMIN", active: true, passwordHash: { not: null } } })) <= 1) throw new ServiceError("At least one active administrator is required.");
    }
    await prisma.user.update({ where: { id }, data: { active } });
    if (!active) {
      await prisma.session.deleteMany({ where: { userId: id } });
      await revokeInvitations(prisma, id);
    }
    revalidatePath("/settings/users");
    return { ok: true, message: active ? "User reactivated" : "User deactivated and signed out" };
  } catch (e) {
    return toActionError(e);
  }
}

export async function changeOwnPasswordAction(current: string, next: string, code: string): Promise<ActionResult> {
  try {
    const me = await assertUser();
    const pw = passwordField.parse(next);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!user.passwordHash || !(await verifyPassword(current, user.passwordHash))) throw new ServiceError("Your current password is incorrect.");
    if (!(await verifyCurrentUserCode(prisma, me.id, code))) throw new ServiceError("The authenticator code is not valid.");
    await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(pw) } });
    await audit(prisma, { userId: me.id, action: "auth.password_changed", summary: "Password changed" });
    return { ok: true, message: "Password changed" };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return toActionError(e);
  }
}

export async function regenerateRecoveryCodesAction(code: string): Promise<ActionResult<{ codes: string[] }>> {
  try {
    const me = await assertUser();
    if (!(await verifyCurrentUserCode(prisma, me.id, code))) throw new ServiceError("The authenticator code is not valid.");
    const codes = await regenerateRecoveryCodes(prisma, me.id);
    await audit(prisma, { userId: me.id, action: "auth.recovery_regenerated", summary: "Recovery codes regenerated" });
    revalidatePath("/settings/security");
    return { ok: true, data: { codes }, message: "New recovery codes generated — the old ones no longer work." };
  } catch (e) {
    return toActionError(e);
  }
}
