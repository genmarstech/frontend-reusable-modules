import "server-only";

import { apiFetch } from "../client";
import type { BusinessMembership, Paginated } from "../types";

/** GET /api/ops/<slug>/members/ — list: any active member. */
export function listOpsMembers(accessToken: string, businessSlug: string) {
  return apiFetch<Paginated<BusinessMembership>>(`ops/${businessSlug}/members/`, { accessToken });
}

/**
 * POST /api/ops/<slug>/members/ — owner only. Takes a numeric `user` id,
 * not an email: there is no endpoint anywhere in this backend that looks a
 * user up by email (accounts/identity.py's own anti-enumeration stance —
 * an arbitrary "does this email have an account" lookup is exactly the
 * oracle that module exists to prevent), so an owner has to already know
 * the target's user id. A real "invite by email" flow needs a backend
 * decision on how to do that safely, not a frontend-only workaround.
 */
export function addOpsMember(accessToken: string, businessSlug: string, userId: number, role: string) {
  return apiFetch<BusinessMembership>(`ops/${businessSlug}/members/`, {
    accessToken,
    method: "POST",
    body: { user: userId, role },
  });
}

export function updateOpsMember(
  accessToken: string,
  businessSlug: string,
  id: number | string,
  input: { role?: string; status?: string }
) {
  return apiFetch<BusinessMembership>(`ops/${businessSlug}/members/${id}/`, {
    accessToken,
    method: "PATCH",
    body: input,
  });
}

export function removeOpsMember(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<undefined>(`ops/${businessSlug}/members/${id}/`, { accessToken, method: "DELETE" });
}
