import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { backendLogout } from "@/lib/auth/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/csrf";

/**
 * Clearing the local session always happens, regardless of whether the
 * backend call below succeeds — matching the backend's own LogoutView,
 * which treats an already-invalid refresh token as "still a success."
 * A network failure or an already-expired access token here must not
 * leave the browser holding cookies this app still thinks are a session.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: "Request origin could not be verified." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (access) {
    try {
      await backendLogout(access, refresh);
    } catch {
      // Best-effort — see module comment.
    }
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.delete({ name: ACCESS_COOKIE, path: "/" });
  response.cookies.delete({ name: REFRESH_COOKIE, path: "/" });
  return response;
}
