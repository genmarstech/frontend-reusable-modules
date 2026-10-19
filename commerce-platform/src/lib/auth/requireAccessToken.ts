import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "./cookies";

/**
 * The Server Action counterpart to session.ts::getAccessToken() — reused
 * everywhere a mutation (add to cart, checkout, cancel an order) needs a
 * token rather than a page render. Server Components can't set cookies
 * (session.ts's own comment), so proxy.ts is the only place that refreshes
 * an expiring token today — but proxy.ts only runs its session gate on
 * `/dashboard` and the specific `/store/[slug]/{cart,checkout,orders}`
 * paths it protects, NOT on a public product page, which is exactly where
 * "Add to cart" lives. A Server Action invoked from there can be the first
 * thing in a request to notice a cookie is missing or already expired, so
 * it needs its own backstop rather than assuming proxy.ts already handled it.
 *
 * Deliberately simple: redirects to sign-in on a missing token rather than
 * attempting its own refresh — the next full navigation through proxy.ts
 * (e.g. the sign-in redirect itself) is what actually refreshes a merely-
 * expiring token; this only needs to handle "no usable token at all."
 */
export async function requireAccessToken(nextPath: string): Promise<string> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!access) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return access;
}

/**
 * For a 401 the backend returns mid-action (the access token looked present
 * but the backend rejected it anyway — expired between the cookie read and
 * the request, or revoked) — clears both cookies so the browser doesn't go
 * on believing it has a session, then sends the caller to sign in again.
 * Mirrors proxy.ts's own refresh-failure branch.
 */
export async function clearSessionAndRedirectToLogin(nextPath: string): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect(`/login?next=${encodeURIComponent(nextPath)}&reason=session_expired`);
}
