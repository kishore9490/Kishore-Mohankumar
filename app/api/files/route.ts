import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";

/**
 * Demo storage endpoint for signed URLs. Verifies signature, expiry and a signed-in
 * user. In production the storage provider serves files directly from its own signed URLs.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const exp = Number(url.searchParams.get("exp"));
  const sig = url.searchParams.get("sig") ?? "";
  const expected = createHmac("sha256", process.env.AUTH_SECRET ?? "emc-demo").update(`${key}:${exp}`).digest("base64url");
  const valid = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid || !exp || exp * 1000 < Date.now()) return NextResponse.json({ error: "Link expired or invalid." }, { status: 403 });
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = `EMC Academy — demo file\n\nObject: ${key}\n\nThis is a placeholder. Real files are served from the configured storage provider once it is connected.`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" } });
}
