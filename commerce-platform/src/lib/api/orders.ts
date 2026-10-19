import "server-only";

import { apiFetch } from "./client";
import type { Order, Paginated } from "./types";

/**
 * POST /api/<business_slug>/checkout/ — body is EITHER `address_id` (an
 * existing accounts.Address) OR the delivery fields directly
 * (orders/serializers.py::CheckoutSerializer.validate() requires one or the
 * other, never both/neither). All pricing/availability is re-validated
 * server-side from the caller's current cart — nothing sent here is trusted
 * for totals; a successful call empties that cart as a side effect.
 */
export type CheckoutInput =
  | { address_id: number; contact_phone?: string }
  | {
      delivery_recipient_name: string;
      delivery_line1: string;
      delivery_city: string;
      delivery_phone: string;
      delivery_line2?: string;
      contact_phone?: string;
    };

export function checkout(accessToken: string, businessSlug: string, input: CheckoutInput) {
  return apiFetch<Order>("checkout/", { businessSlug, accessToken, method: "POST", body: input });
}

/** GET /api/<business_slug>/orders/ — the caller's own orders in this
 * business only (orders/views.py::OrderViewSet.get_queryset()). */
export function listOrders(accessToken: string, businessSlug: string) {
  return apiFetch<Paginated<Order>>("orders/", { businessSlug, accessToken });
}

/** GET /api/<business_slug>/orders/{id}/ — a mismatched id (someone else's
 * order, or an order placed with a different business) 404s, never 403. */
export function getOrder(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<Order>(`orders/${id}/`, { businessSlug, accessToken });
}

/**
 * POST /api/<business_slug>/orders/{id}/cancel/ — the backend itself refuses
 * (400) once the order has moved past `awaiting_payment`/`payment_failed`
 * (orders/views.py::CUSTOMER_CANCELLABLE); this call never decides that
 * client-side, only reflects whatever the backend answers.
 */
export function cancelOrder(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<Order>(`orders/${id}/cancel/`, { businessSlug, accessToken, method: "POST" });
}
