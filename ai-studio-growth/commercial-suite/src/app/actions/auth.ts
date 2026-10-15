"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200), next: z.string().optional() });

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), next: formData.get("next") || undefined });
  if (!parsed.success) return { error: "Enter your email address and password." };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const key = `login:${ip}:${parsed.data.email}`;
  const limit = rateLimit(key, 8, 15 * 60_000);
  if (!limit.ok) return { error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always run a hash comparison to keep timing similar for unknown emails.
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  if (!user || !ok || !user.active) return { error: "Incorrect email or password." };
  resetRateLimit(key);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  const next = parsed.data.next && parsed.data.next.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/";
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
