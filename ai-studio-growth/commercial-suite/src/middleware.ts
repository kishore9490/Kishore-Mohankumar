import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate: requests without a session cookie are redirected to /login.
 * This is only a first line of defence — every page, server action and API route
 * validates the session against the database (see src/lib/auth/session.ts).
 */
const PUBLIC_PREFIXES = [
  "/login",
  "/invite/", // single-use invitation links — verified by token
  "/setup", // first-run bootstrap — requires SETUP_TOKEN and an empty user table
  "/api/webhooks/", // provider webhooks — verified by signature / secret token
  "/api/health", // version + database status; error details require SETUP_TOKEN
  "/print/", // server-side PDF rendering — verified by signed render token
  "/_next/",
  "/favicon",
  "/brand/",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get("cs_session")?.value) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
