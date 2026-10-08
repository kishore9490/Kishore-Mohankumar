"use server";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/server/db/store";
import { hashPassword } from "@/server/db/seed";
import {
  clearAttempts, createSession, destroySession, getCurrentUser, isRateLimited, recordFailedAttempt, revokeUserSessions, toSessionUser, verifyPassword,
} from "@/server/auth/session";
import { audit } from "@/server/services/audit";
import { ROLES } from "@/lib/platform/rbac";
import { sendMessage } from "@/server/services/communication";
import { renderTemplate } from "@/server/services/templates";
import { site } from "@/data/site";

export interface LoginState {
  error: string | null;
  identifier?: string;
}

const digits = (s: string) => s.replace(/\D/g, "");

/** Same response for "unknown user" and "wrong password" so accounts can't be probed. */
export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const identifier = String(form.get("identifier") ?? "").trim().slice(0, 160);
  const password = String(form.get("password") ?? "");
  const remember = form.get("remember") === "on";
  const next = String(form.get("next") ?? "");
  if (!identifier || !password) return { error: "Enter your email or mobile number and your password.", identifier };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = `${ip}:${identifier.toLowerCase()}`;
  if (isRateLimited(key)) return { error: "Too many attempts. Please wait 10 minutes and try again.", identifier };

  const user = db().users.find((u) =>
    identifier.includes("@") ? u.email.toLowerCase() === identifier.toLowerCase() : !!u.phone && digits(u.phone).endsWith(digits(identifier)) && digits(identifier).length >= 10,
  );
  if (!user || user.passwordHash === "!" || !verifyPassword(password, user.passwordHash)) {
    recordFailedAttempt(key);
    await audit({ user: user ? { id: user.id, name: user.name } : null, action: "auth.login", objectType: "User", objectId: user?.id ?? null, result: "failed", meta: { identifier: identifier.replace(/(.{2}).+(@.+)?/, "$1***") } });
    return { error: "That email/mobile and password don’t match. Check them and try again.", identifier };
  }
  if (user.status !== "active") {
    await audit({ user, action: "auth.login", objectType: "User", objectId: user.id, result: "denied", meta: { reason: user.status } });
    return { error: "This account is disabled. Please contact the EMC office.", identifier };
  }

  clearAttempts(key);
  user.lastLoginAt = new Date().toISOString();
  await createSession(user, remember);
  await audit({ user, action: "auth.login", objectType: "User", objectId: user.id });
  const home = ROLES[user.role].home;
  redirect(next.startsWith("/academy") && toSessionUser(user) ? next : home);
}

export async function logoutAction() {
  const u = await getCurrentUser();
  if (u) await audit({ user: u, action: "auth.logout", objectType: "User", objectId: u.id });
  await destroySession();
  redirect("/login?signedout=1");
}

export async function requestPasswordReset(_: { sent: boolean }, form: FormData): Promise<{ sent: boolean }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const user = db().users.find((u) => u.email.toLowerCase() === email && u.status === "active");
  if (user) {
    const token = randomBytes(32).toString("base64url");
    db().passwordResets.push({ tokenHash: createHash("sha256").update(token).digest("hex"), userId: user.id, expiresAt: Date.now() + 30 * 60_000, usedAt: null });
    const tpl = db().templates.find((t) => t.id === "tpl_pwd_reset")!;
    const url = `${site.url}/reset-password?token=${token}`;
    await sendMessage({ channel: "email", to: user.email, subject: tpl.subject, text: renderTemplate(tpl.content, { reset_url: url }), templateId: tpl.id, event: "auth.password_reset", userId: user.id });
    await audit({ user, action: "auth.password_reset_requested", objectType: "User", objectId: user.id });
    if (process.env.NODE_ENV !== "production") console.info(`[demo] password reset link for ${user.email}: ${url}`);
  }
  return { sent: true };
}

export async function resetPassword(_: { error: string | null }, form: FormData): Promise<{ error: string | null }> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return { error: "Use at least 10 characters with letters and numbers." };
  const hash = createHash("sha256").update(token).digest("hex");
  const r = db().passwordResets.find((x) => x.tokenHash === hash && !x.usedAt && x.expiresAt > Date.now());
  if (!r) return { error: "This reset link has expired or was already used. Request a new one." };
  const user = db().users.find((u) => u.id === r.userId)!;
  user.passwordHash = hashPassword(password);
  r.usedAt = Date.now();
  revokeUserSessions(user.id);
  await audit({ user, action: "auth.password_reset", objectType: "User", objectId: user.id });
  redirect("/login?reset=1");
}
