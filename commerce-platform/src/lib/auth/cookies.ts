import "server-only";

/**
 * Cookie names match the sibling `e-commerce` module's own convention in
 * this repo (`gm_access`/`gm_refresh`) — no reason to invent new names for
 * the same concept one directory over, and it keeps the pattern
 * recognizable across modules even though the two talk to different
 * backends.
 *
 * Both cookies are httpOnly (never readable from `document.cookie` or any
 * browser JS), Secure outside local dev, and SameSite=Lax — Lax still
 * sends the cookie on a normal top-level navigation (follow a link, open
 * a bookmark) while refusing it on a cross-site POST, which is most of
 * what makes CSRF against cookie auth work in the first place. The
 * explicit Origin check in src/lib/auth/csrf.ts is the second, independent
 * layer — Lax alone is not treated as sufficient on its own, per the
 * brief's own instruction not to assume one control covers it.
 */
export const ACCESS_COOKIE = "gm_access";
export const REFRESH_COOKIE = "gm_refresh";

export const ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 60; // matches SIMPLE_JWT.ACCESS_TOKEN_LIFETIME
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // matches SIMPLE_JWT.REFRESH_TOKEN_LIFETIME

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
