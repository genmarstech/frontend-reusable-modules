import "server-only";

import { cookies } from "next/headers";

import { backendMe } from "./backend";
import { ACCESS_COOKIE } from "./cookies";
import type { User } from "../api/types";

/**
 * For Server Components / Server Actions, which can read cookies but
 * cannot set them — by the time a protected page under /dashboard runs,
 * middleware.ts has already refreshed the access cookie if it needed
 * refreshing, so this only ever reads, never refreshes.
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

/**
 * Returns null for "no session" or "the backend rejected this token" —
 * deliberately not distinguishing the two to a caller that just needs to
 * know whether it has an authenticated user to show data for. A caller
 * that needs a 401 vs. "never logged in" distinction should call
 * backendMe() directly and handle the ApiError itself.
 */
export async function getCurrentUser(): Promise<User | null> {
  const access = await getAccessToken();
  if (!access) return null;
  try {
    return await backendMe(access);
  } catch {
    return null;
  }
}
