// Next.js's file-convention "Proxy" (formerly "Middleware") — unrelated to
// this app's own app/api/proxy/[...path] BFF route despite the name
// collision. This one runs on every page navigation, server-side, before
// any route renders; that one is the door client-side JS uses to reach
// Django. Different mechanism, same spirit (keep Django calls server-side).

import { NextResponse, type NextRequest } from "next/server";
import { refreshAccessToken } from "@/lib/auth-service";
import { isExpiredOrExpiringSoon } from "@/lib/jwt";

const ACCESS_COOKIE = "gm_access";
const REFRESH_COOKIE = "gm_refresh";
const ACCESS_MAX_AGE = 60 * 30;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Runs before every page request (not /api — those manage their own
 * cookies). Two jobs:
 *
 * 1. Keep the access cookie fresh. Server Components can't write cookies
 *    during render, so this is the one place a near-expired access token
 *    gets rotated — by the time a Server Component's data fetch runs, the
 *    cookie is already current.
 * 2. Gate /admin/* on "is there a session at all". This is a cheap,
 *    no-Django-roundtrip check — it does NOT confirm the user is staff.
 *    That's Django's `IsAdminUser` on every `/api/ops/*` call, which is the
 *    real authorization boundary (see the frontend plan's auth section).
 */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const response = NextResponse.next();

  let authenticated = Boolean(access);

  if (isExpiredOrExpiringSoon(access)) {
    authenticated = false;
    if (refresh) {
      try {
        const refreshed = await refreshAccessToken(refresh);
        response.cookies.set(ACCESS_COOKIE, refreshed.access, { ...COOKIE_OPTS, maxAge: ACCESS_MAX_AGE });
        if (refreshed.refresh) {
          response.cookies.set(REFRESH_COOKIE, refreshed.refresh, { ...COOKIE_OPTS, maxAge: REFRESH_MAX_AGE });
        }
        authenticated = true;
      } catch {
        response.cookies.delete(ACCESS_COOKIE);
        response.cookies.delete(REFRESH_COOKIE);
      }
    }
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
