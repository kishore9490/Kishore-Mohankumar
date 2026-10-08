import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate only: bounces visitors without a session cookie away from the
 * academy. Real authentication and permission checks happen on the server in
 * every academy layout, page, server action and API route.
 */
export function proxy(req: NextRequest) {
  if (!req.cookies.get("emc_session")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "same-origin");
  return res;
}

export const config = { matcher: ["/academy/:path*"] };
