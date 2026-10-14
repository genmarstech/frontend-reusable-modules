import "server-only";
import { cookies } from "next/headers";

// httpOnly everywhere — the whole point of the BFF proxy is that these
// never reach client-side JS. Secure is off in dev only because `next dev`
// serves plain HTTP; it's forced on for anything that isn't NODE_ENV=development.
export const ACCESS_COOKIE = "gm_access";
export const REFRESH_COOKIE = "gm_refresh";

export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax" as const,
  path: "/",
};

// Mirrors config/settings.py's SIMPLE_JWT lifetimes on the Django side —
// keep these two in sync if that ever changes.
export const ACCESS_MAX_AGE = 60 * 30;
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

/** For use in a Server Component (or anywhere) — reads only. */
export async function readSessionCookies() {
  const store = await cookies();
  return {
    access: store.get(ACCESS_COOKIE)?.value,
    refresh: store.get(REFRESH_COOKIE)?.value,
  };
}

/** For use in a Server Action or Route Handler, which are allowed to write. */
export async function setSessionCookies(access: string, refresh: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, { ...SESSION_COOKIE_OPTS, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, refresh, { ...SESSION_COOKIE_OPTS, maxAge: REFRESH_MAX_AGE });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
