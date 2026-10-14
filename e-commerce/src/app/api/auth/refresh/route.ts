import { NextResponse } from "next/server";
import { readSessionCookies, setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies";
import { refreshAccessToken } from "@/lib/auth-service";

/**
 * Manual refresh trigger — middleware.ts already does this proactively on
 * page navigation, but a client-side TanStack Query call can hit a 401
 * between navigations (a long-lived admin tab left open past the access
 * token's 30-minute life). The admin query client's error handling calls
 * this once before giving up and redirecting to /login.
 */
export async function POST() {
  const { refresh } = await readSessionCookies();
  if (!refresh) {
    return NextResponse.json({ detail: "No session to refresh." }, { status: 401 });
  }

  try {
    const refreshed = await refreshAccessToken(refresh);
    await setSessionCookies(refreshed.access, refreshed.refresh ?? refresh);
    return NextResponse.json({ ok: true });
  } catch {
    await clearSessionCookies();
    return NextResponse.json({ detail: "Session expired." }, { status: 401 });
  }
}
