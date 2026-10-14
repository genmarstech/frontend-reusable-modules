import "server-only";
import { cache } from "react";
import { djangoFetch, ApiRequestError } from "./django";
import { readSessionCookies } from "./auth-cookies";
import type { User } from "./types";

/**
 * The current signed-in user, or null. `cache()` memoizes this per request
 * so every Server Component on a page that calls it only costs one `/api/me/`
 * round trip, however many components ask.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { access } = await readSessionCookies();
  if (!access) return null;

  try {
    return await djangoFetch<User>("/api/me/");
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) return null;
    throw error;
  }
});

/**
 * `is_staff` isn't in the JWT or on `/api/me/` — the only way to know is to
 * ask a staff-only endpoint and see whether it's a 403. Deliberately not
 * cached as aggressively as `getCurrentUser`: this IS the authorization
 * check the admin layout relies on, so it always hits Django fresh rather
 * than trusting anything client-supplied.
 */
export const isStaff = cache(async (): Promise<boolean> => {
  const { access } = await readSessionCookies();
  if (!access) return false;

  try {
    await djangoFetch("/api/ops/dashboard/");
    return true;
  } catch (error) {
    if (error instanceof ApiRequestError && (error.isForbidden || error.isUnauthorized)) {
      return false;
    }
    throw error;
  }
});
