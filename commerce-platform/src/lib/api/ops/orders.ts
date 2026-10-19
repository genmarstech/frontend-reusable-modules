import "server-only";

import { apiFetch } from "../client";
import type { Order, OrderSummary, Paginated } from "../types";

/**
 * `/api/ops/<slug>/...` — the staff tree, one segment different from the
 * storefront tree apiFetch's own `businessSlug` option templates. Built
 * directly here rather than reusing that option, same reasoning as
 * lib/api/businesses.ts::getDashboard.
 */

export function listOpsOrders(
  accessToken: string,
  businessSlug: string,
  params: { status?: string; search?: string } = {}
) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<Paginated<OrderSummary>>(`ops/${businessSlug}/orders/${qs ? `?${qs}` : ""}`, { accessToken });
}

export function getOpsOrder(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<Order>(`ops/${businessSlug}/orders/${id}/`, { accessToken });
}

/**
 * POST /api/ops/<slug>/orders/{id}/transition/ — the same
 * orders.services.transition() state machine the customer-facing cancel
 * action goes through; ALLOWED_TRANSITIONS on the backend decides what's
 * actually possible from the order's current status, not this call.
 */
export function transitionOpsOrder(
  accessToken: string,
  businessSlug: string,
  id: number | string,
  toStatus: string,
  note?: string
) {
  return apiFetch<Order>(`ops/${businessSlug}/orders/${id}/transition/`, {
    accessToken,
    method: "POST",
    body: { to_status: toStatus, note },
  });
}
