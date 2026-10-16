import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-health";
import { brevoKeyFromEnv, brevoStatus } from "@/lib/integrations/config";
import { brevoSendEmail, brevoTestConnection } from "@/lib/integrations/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenOk(given: string | null) {
  const expected = process.env.SETUP_TOKEN ?? "";
  if (!given || expected.length < 16) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * GET /api/health — public: deployed version and database status (no secrets).
 * GET /api/health?token=SETUP_TOKEN — also email status and the latest recorded server errors.
 * GET /api/health?token=SETUP_TOKEN&testEmail=you@example.com — also checks Brevo and sends a test email.
 */
export async function GET(req: Request) {
  const out: Record<string, unknown> = {
    app: "AI Studio Quote Studio",
    build: process.env.NEXT_PUBLIC_BUILD_ID,
    builtAt: process.env.NEXT_PUBLIC_BUILD_TIME,
    node: process.version,
  };
  try {
    await prisma.user.count();
    out.database = "ok";
  } catch (e) {
    out.database = describeDbError(e).title;
  }
  const params = new URL(req.url).searchParams;
  if (tokenOk(params.get("token"))) {
    try {
      const b = await brevoStatus();
      out.email = { configured: b.configured, missing: b.missing, sender: b.senderEmail, senderName: b.senderName, apiKey: b.apiKeyMasked, apiKeySource: b.apiKeyMasked ? ((await brevoKeyFromEnv()) ? "environment variable" : "Settings") : null };
      const to = params.get("testEmail")?.trim();
      if (to) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) out.testEmail = "testEmail is not a valid email address";
        else {
          try {
            const c = await brevoTestConnection();
            const r = await brevoSendEmail({ to, subject: "AI Studio Quote Studio test email", text: "This is a test email from AI Studio Quote Studio.\n\nIf you received it, Brevo is configured correctly.", tags: ["test"] });
            out.testEmail = { brevoAccount: c.email, sender: c.senderMessage, result: `Accepted by Brevo for ${to}`, messageId: r.messageId };
          } catch (e) {
            out.testEmail = { error: (e as Error).message };
          }
        }
      }
    } catch (e) {
      out.email = `could not read: ${(e as Error).message.split("\n")[0]}`;
    }
    try {
      const v = await prisma.$queryRawUnsafe<{ v: string }[]>("SELECT VERSION() AS v");
      out.databaseVersion = v[0]?.v;
      const errors = await prisma.auditEvent.findMany({ where: { action: "system.error" }, orderBy: { createdAt: "desc" }, take: 10 });
      out.recentErrors = errors.map((e) => ({ at: e.createdAt, error: e.summary }));
    } catch (e) {
      out.recentErrors = `could not read: ${describeDbError(e).title}`;
    }
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
