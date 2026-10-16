import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { describeDbError } from "@/lib/db-health";

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
 * GET /api/health?token=SETUP_TOKEN — also the latest recorded server errors, for diagnosing a crashing page.
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
  if (tokenOk(new URL(req.url).searchParams.get("token"))) {
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
