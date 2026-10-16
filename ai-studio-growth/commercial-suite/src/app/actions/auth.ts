"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { clearChallengeCookie, createSession, destroySession, readChallengeCookie, setChallengeCookie } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { acceptInvitation, confirmEnrollment, createChallenge, verifyLoginCode } from "@/lib/auth/accounts";
import { passwordField } from "@/lib/validation/schemas";
import { audit } from "@/lib/services/audit";
import { ServiceError } from "@/lib/services/errors";

const DUMMY_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA";

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}

function safeNext(next?: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200), next: z.string().optional() });

/** Step 1: password. On success the user continues to the authenticator step (never straight to a session). */
export async function loginAction(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") || undefined });
  if (!parsed.success) return { error: "Enter your email address and password." };
  const key = `login:${await clientIp()}:${parsed.data.email}`;
  const limit = rateLimit(key, 8, 15 * 60_000);
  if (!limit.ok) return { error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always run a hash comparison so response time does not reveal whether the account exists.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.passwordHash || !ok || !user.active) return { error: "Incorrect email or password. New team members must first accept their invitation link." };
  resetRateLimit(key);

  const next = encodeURIComponent(safeNext(parsed.data.next));
  if (user.mfaEnabled && user.mfaSecretEnc) {
    await setChallengeCookie(await createChallenge(prisma, user.id, "LOGIN"));
    redirect(`/login/verify?next=${next}`);
  }
  // Accounts created before MFA was introduced must enrol an authenticator before getting a session.
  await setChallengeCookie(await createChallenge(prisma, user.id, "ENROLL"));
  redirect(`/login/setup?next=${next}`);
}

export type OtpActionResult = { ok: true; redirectTo: string; notice?: string } | { ok: false; error: string; attemptsLeft: number; restart?: boolean };

/** Step 2: 6-digit authenticator code (or a recovery code). Returns a result so the client can animate. */
export async function verifyLoginOtpAction(code: string, next?: string): Promise<OtpActionResult> {
  const limit = rateLimit(`otp:${await clientIp()}`, 30, 15 * 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts from this network. Please wait a few minutes.", attemptsLeft: 0, restart: true };
  const res = await verifyLoginCode(prisma, await readChallengeCookie(), String(code ?? "").slice(0, 20));
  if (!res.ok) {
    if (res.restart) await clearChallengeCookie();
    return res;
  }
  await clearChallengeCookie();
  await prisma.user.update({ where: { id: res.userId }, data: { lastLoginAt: new Date() } });
  await prisma.session.deleteMany({ where: { userId: res.userId, expiresAt: { lt: new Date() } } });
  await createSession(res.userId);
  await audit(prisma, { userId: res.userId, action: "auth.login", summary: res.usedRecoveryCode ? "Signed in with a recovery code" : "Signed in with authenticator code" });
  return {
    ok: true,
    redirectTo: safeNext(next),
    notice: res.usedRecoveryCode ? `Recovery code used. ${res.remainingRecoveryCodes} remaining — generate new codes in Settings → Security if you are running low.` : undefined,
  };
}

export type EnrollResult = { ok: true; recoveryCodes: string[] } | { ok: false; error: string; attemptsLeft: number; restart?: boolean };

/** Confirms the first code from a newly added authenticator, then signs the user in. */
export async function confirmEnrollmentAction(code: string): Promise<EnrollResult> {
  const limit = rateLimit(`otp:${await clientIp()}`, 30, 15 * 60_000);
  if (!limit.ok) return { ok: false, error: "Too many attempts from this network. Please wait a few minutes.", attemptsLeft: 0, restart: true };
  const res = await confirmEnrollment(prisma, await readChallengeCookie(), String(code ?? "").slice(0, 10));
  if (!res.ok) {
    if (res.restart) await clearChallengeCookie();
    return res;
  }
  await clearChallengeCookie();
  await prisma.user.update({ where: { id: res.userId }, data: { lastLoginAt: new Date() } });
  await createSession(res.userId);
  await audit(prisma, { userId: res.userId, action: "auth.mfa_enrolled", summary: "Authenticator app set up (MFA enabled)" });
  return { ok: true, recoveryCodes: res.recoveryCodes ?? [] };
}

const acceptSchema = z
  .object({ token: z.string().min(20).max(100), password: passwordField, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

/** Invitation acceptance: set a password, then continue to authenticator setup. */
export async function acceptInviteAction(input: z.input<typeof acceptSchema>): Promise<{ ok: false; error: string } | void> {
  const parsed = acceptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!rateLimit(`invite:${await clientIp()}`, 20, 15 * 60_000).ok) return { ok: false, error: "Too many attempts. Please wait a few minutes." };
  let userId: string;
  try {
    userId = await acceptInvitation(prisma, parsed.data.token, parsed.data.password);
  } catch (e) {
    return { ok: false, error: e instanceof ServiceError ? e.message : "Could not accept the invitation." };
  }
  await audit(prisma, { userId, action: "auth.invite_accepted", summary: "Invitation accepted and password set" });
  await setChallengeCookie(await createChallenge(prisma, userId, "ENROLL"));
  redirect("/login/setup?welcome=1");
}

export async function restartLoginAction() {
  await clearChallengeCookie();
  redirect("/login");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
