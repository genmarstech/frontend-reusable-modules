// Next.js's file-convention "Proxy" (formerly "Middleware") — matches the
// sibling `e-commerce` module's own naming for the same mechanism in this
// repo. Runs on every matched navigation, server-side, before the route
// renders.

import { NextRequest, NextResponse } from "next/server";

import { backendRefresh } from "@/lib/auth/backend";
import { listCategories } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { isExpiredOrInvalid } from "@/lib/auth/jwt";

/**
 * Gate for protected routes — cheap check only, same convention the
 * sibling `e-commerce` module documents for its own proxy: "only checks
 * is there an auth cookie at all... the actual authorization is left to"
 * the backend. This never decides WHICH business or WHAT role a request
 * is allowed to see — only whether a session exists at all. The
 * protected page itself still has to call a real backend endpoint and
 * handle whatever that endpoint says, including a 403/404 for a business
 * the session's user isn't authorized for.
 *
 * The one thing beyond a bare presence check this does do: proactively
 * refresh an access token that's expired or about to be, so the
 * protected page itself never has to contain token-refresh logic (and
 * can't — a Server Component can't set cookies during its own render;
 * only the proxy, a Route Handler, or a Server Action can).
 */
export async function proxy(request: NextRequest) {
  const storeSlug = storeSlugFrom(request.nextUrl.pathname);
  if (storeSlug) {
    const existence = await checkStoreExists(storeSlug);
    if (existence === "missing") {
      return NextResponse.rewrite(new URL("/store/unavailable", request.url), { status: 404 });
    }

    // Everything else under /store/[slug]/ — browsing the catalog, a
    // product page — stays public; only cart/checkout/order-history need
    // a session, and only those three get the same gate /dashboard gets.
    if (requiresAccountIn(request.nextUrl.pathname)) {
      return applySessionGate(request);
    }
    return NextResponse.next();
  }

  return applySessionGate(request);
}

async function applySessionGate(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (access && !isExpiredOrInvalid(access)) {
    return NextResponse.next();
  }

  if (!refresh) {
    // Never had a session at all — a plain login page, no "your session
    // expired" messaging that would be misleading for a first-time visit.
    return redirectToLogin(request);
  }

  try {
    const result = await backendRefresh(refresh);
    const response = NextResponse.next();
    response.cookies.set(ACCESS_COOKIE, result.access, sessionCookieOptions(ACCESS_COOKIE_MAX_AGE_SECONDS));
    response.cookies.set(REFRESH_COOKIE, result.refresh, sessionCookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS));
    return response;
  } catch {
    // Expired, blacklisted, or the backend is unreachable — either way,
    // no session survives this request. Never surface why; "session
    // expired" covers all three without any token-shaped detail.
    const response = redirectToLogin(request, "session_expired");
    response.cookies.delete({ name: ACCESS_COOKIE, path: "/" });
    response.cookies.delete({ name: REFRESH_COOKIE, path: "/" });
    return response;
  }
}

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  if (reason) url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

function storeSlugFrom(pathname: string): string | null {
  const match = pathname.match(/^\/store\/([^/]+)/);
  if (!match || match[1] === "unavailable") return null;
  return match[1];
}

/**
 * `/store/[slug]/cart`, `/checkout`, and `/orders` (list and detail) are the
 * only storefront routes that need a signed-in customer — everything else
 * under a store slug (the storefront itself, a product page) stays public.
 * These three are also the only `/api/<slug>/...` endpoints that require
 * `IsAuthenticated` on the backend side (cart/views.py, orders/views.py) —
 * this list exists to match that, not to invent a stricter frontend-only
 * rule.
 */
function requiresAccountIn(pathname: string): boolean {
  return /^\/store\/[^/]+\/(cart|checkout|orders)(\/|$)/.test(pathname);
}

/**
 * Exists only to get a REAL HTTP 404 on a hard navigation — the rendering
 * path (`/store/[slug]/layout.tsx`) does its own, independent
 * notFound() call too, and would catch this on its own correctly for a
 * client-side RSC navigation; it's a data fetch streamed behind a
 * Suspense boundary, though, so by the time it runs on a fresh document
 * request, the response has already started and its status is locked at
 * 200 (confirmed live — see src/app/store/unavailable/page.tsx). This is
 * the documented fix for that: do the (cheap — `/categories/`, not a
 * products fetch) existence check before anything streams, and rewrite
 * to a route with no data dependency of its own, which Next.js CAN
 * resolve to a true 404 before its first byte goes out.
 *
 * A network failure is reported as "unknown", not "missing" — the page's
 * own fetch will hit the same failure and render its own ErrorState; this
 * must never silently become a false 404.
 */
async function checkStoreExists(slug: string): Promise<"exists" | "missing" | "unknown"> {
  try {
    await listCategories(slug);
    return "exists";
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return "missing";
    }
    return "unknown";
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/store/:path*"],
};
