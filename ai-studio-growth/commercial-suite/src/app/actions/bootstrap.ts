"use server";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { inviteUser } from "@/lib/auth/accounts";
import { seedBase, seedSampleData } from "@/lib/sample-data";
import { rateLimit } from "@/lib/auth/rate-limit";
import { headers } from "next/headers";

/**
 * First-run bootstrap for hosts without a terminal (e.g. Hostinger web hosting).
 * Works only while no user exists AND the caller knows SETUP_TOKEN (server environment variable).
 */
function tokenMatches(given: string) {
  const expected = process.env.SETUP_TOKEN ?? "";
  if (expected.length < 16) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const schema = z.object({
  token: z.string().max(200),
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  samples: z.boolean(),
});

export async function bootstrapAction(input: z.input<typeof schema>): Promise<{ error: string } | void> {
  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!rateLimit(`setup:${ip}`, 10, 15 * 60_000).ok) return { error: "Too many attempts. Please wait a few minutes." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!tokenMatches(parsed.data.token)) return { error: "The setup token is not valid. Check SETUP_TOKEN in your hosting environment variables." };
  if ((await prisma.user.count()) > 0) return { error: "Setup has already been completed. Sign in instead." };
  await seedBase(prisma, { createAdmin: false });
  const { userId, token } = await inviteUser(prisma, { name: parsed.data.name, email: parsed.data.email, role: "ADMIN" }, null);
  if (parsed.data.samples) await seedSampleData(prisma, userId);
  redirect(`/invite/${token}`);
}
