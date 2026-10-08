import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, newId } from "@/server/db/store";
import { permissionsFor, ROLES } from "@/lib/platform/rbac";
import type { Permission, SessionUser, User } from "@/lib/platform/types";
import { audit } from "@/server/services/audit";

export const SESSION_COOKIE = "emc_session";
const SHORT_TTL = 12 * 60 * 60 * 1000; // 12 h
const REMEMBER_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    throw new Error("AUTH_SECRET (32+ characters) is required in production.");
  }
  // Demo / development only.
  return "emc-demo-only-secret-change-me-before-launch-0000";
}

/* ---------------- passwords ---------------- */

export function verifyPassword(password: string, stored: string) {
  const [alg, n, saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: 8, p: 1 });
  return timingSafeEqual(actual, expected);
}

/* ---------------- signed session token ---------------- */

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encode(sessionId: string) {
  return `${sessionId}.${sign(sessionId)}`;
}

function decode(token: string | undefined) {
  if (!token) return null;
  const [id, sig] = token.split(".");
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

export async function createSession(user: User, remember: boolean) {
  const ttl = remember ? REMEMBER_TTL : SHORT_TTL;
  const h = await headers();
  const s = {
    id: newId("ses") + randomBytes(12).toString("hex"),
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl).toISOString(),
    userAgent: h.get("user-agent"),
    revokedAt: null,
  };
  db().authSessions.push(s);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encode(s.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: ttl / 1000 } : {}),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const id = decode(jar.get(SESSION_COOKIE)?.value);
  const s = id && db().authSessions.find((x) => x.id === id);
  if (s) s.revokedAt = new Date().toISOString();
  jar.delete(SESSION_COOKIE);
}

/** Revoke every session for a user (used when disabling an account or resetting a password). */
export function revokeUserSessions(userId: string) {
  const now = new Date().toISOString();
  for (const s of db().authSessions) if (s.userId === userId && !s.revokedAt) s.revokedAt = now;
}

export function toSessionUser(u: User): SessionUser {
  const parts = u.name.replace(/^Dr\.\s*/, "").split(" ");
  return {
    id: u.id,
    name: u.name,
    firstName: parts[0],
    email: u.email,
    role: u.role,
    title: u.title,
    initials: (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase(),
    permissions: permissionsFor(u.role, u.extraPermissions),
  };
}

/** The signed-in user, or null. Validated against the server-side session store every request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const id = decode(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const s = db().authSessions.find((x) => x.id === id);
  if (!s || s.revokedAt || new Date(s.expiresAt).getTime() < Date.now()) return null;
  const u = db().users.find((x) => x.id === s.userId);
  if (!u || u.status !== "active") return null;
  return toSessionUser(u);
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) redirect("/login?expired=1");
  return u;
}

/** Server-side authorization for pages: redirects to the user's home with a notice when denied. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const u = await requireUser();
  if (!u.permissions.includes(permission)) {
    await audit({ user: u, action: "access.denied", objectType: "Permission", objectId: permission, result: "denied" });
    redirect(`${ROLES[u.role].home}?denied=${encodeURIComponent(permission)}`);
  }
  return u;
}

/** Authorization for server actions / route handlers: throws instead of redirecting. */
export async function assertPermission(permission: Permission): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("unauthenticated");
  if (!u.permissions.includes(permission)) {
    await audit({ user: u, action: "access.denied", objectType: "Permission", objectId: permission, result: "denied" });
    throw new AuthError("forbidden");
  }
  return u;
}

export class AuthError extends Error {
  constructor(public reason: "unauthenticated" | "forbidden") {
    super(reason);
  }
}

/* ---------------- rate limiting ---------------- */

const WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isRateLimited(key: string) {
  const now = Date.now();
  const list = db().loginAttempts;
  for (let i = list.length - 1; i >= 0; i--) if (now - list[i].at > WINDOW) list.splice(i, 1);
  return list.filter((a) => a.key === key).length >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string) {
  db().loginAttempts.push({ key, at: Date.now() });
}

export function clearAttempts(key: string) {
  const list = db().loginAttempts;
  for (let i = list.length - 1; i >= 0; i--) if (list[i].key === key) list.splice(i, 1);
}
