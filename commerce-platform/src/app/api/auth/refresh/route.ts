import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { backendRefresh } from "@/lib/auth/backend";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/csrf";

/**
 * Exposed for completeness/testability and for any client-side code that
 * wants to force a refresh explicitly. The normal path — proactively
 * refreshing before an expired access token ever reaches a protected
 * page — happens in middleware.ts, which calls backendRefresh() directly
 * rather than round-tripping through this route (middleware can set
 * cookies on the response it's already building; there's no reason to
 * add a second HTTP hop to itself).
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: "Request origin could not be verified." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ detail: "No active session." }, { status: 401 });
  }

  try {
    const result = await backendRefresh(refresh);
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(ACCESS_COOKIE, result.access, sessionCookieOptions(ACCESS_COOKIE_MAX_AGE_SECONDS));
    response.cookies.set(REFRESH_COOKIE, result.refresh, sessionCookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS));
    return response;
  } catch {
    // Never echoes the backend's own token-error detail — "Token is
    // invalid or expired" is accurate but there's no reason to hand a
    // client-facing message any token-shaped vocabulary at all.
    const response = NextResponse.json({ detail: "Session expired. Please sign in again." }, { status: 401 });
    response.cookies.delete({ name: ACCESS_COOKIE, path: "/" });
    response.cookies.delete({ name: REFRESH_COOKIE, path: "/" });
    return response;
  }
}
