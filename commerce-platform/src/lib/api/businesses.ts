import "server-only";

import { apiFetch } from "./client";
import type { DashboardSummary, MyBusinessMembership } from "./types";

/**
 * GET /api/me/businesses/ — identity-scoped, no business slug. Added in
 * Phase 2 Step 4 specifically so this page could exist; see
 * docs/API_CONTRACT.md for the verified shape and the gap that preceded
 * it.
 */
export function listMyBusinesses(accessToken: string) {
  return apiFetch<MyBusinessMembership[]>("me/businesses/", { accessToken });
}

/**
 * GET /api/ops/<slug>/dashboard/ — requires an active BusinessMembership
 * in that business (any role). The slug comes from a membership this
 * user's own /api/me/businesses/ call already returned, but this call is
 * still the actual authorization check — the backend re-verifies
 * membership independently on every request; nothing here assumes the
 * slug is accessible just because it appeared in that earlier list.
 */
export function getDashboard(accessToken: string, businessSlug: string) {
  // Built directly rather than via apiFetch's own `businessSlug` option —
  // that option templates `/api/<slug>/...` (the storefront tree); this
  // is `/api/ops/<slug>/...` (the staff tree), one segment different, so
  // reusing the same option under a misleading value would read as "this
  // IS a business slug" when it isn't one.
  return apiFetch<DashboardSummary>(`ops/${businessSlug}/dashboard/`, { accessToken });
}
