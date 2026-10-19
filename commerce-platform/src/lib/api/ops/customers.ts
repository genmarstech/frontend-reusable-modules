import "server-only";

import { apiFetch } from "../client";
import type { Customer, Paginated } from "../types";

/**
 * GET /api/ops/<slug>/customers/ — this business's own customers only;
 * order_count/lifetime_total are annotated scoped to this business, even
 * for a customer who also shops elsewhere (accounts/ops_views.py).
 */
export function listOpsCustomers(accessToken: string, businessSlug: string, search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Paginated<Customer>>(`ops/${businessSlug}/customers/${qs}`, { accessToken });
}

export function getOpsCustomer(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<Customer>(`ops/${businessSlug}/customers/${id}/`, { accessToken });
}
