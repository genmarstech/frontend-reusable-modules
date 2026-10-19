import "server-only";

import { apiFetch } from "./client";
import type { Cart, CartItem } from "./types";

/**
 * GET /api/<business_slug>/cart/ — `IsAuthenticated`, get-or-create on the
 * backend (cart/views.py::CartView.get()) so a first-time visitor always
 * gets a real (empty) cart back, never a 404. One cart per (user, business) —
 * the same account can hold independent carts at two different stores.
 */
export function getCart(accessToken: string, businessSlug: string) {
  return apiFetch<Cart>("cart/", { businessSlug, accessToken });
}

export interface AddCartItemInput {
  product: number;
  variant?: number;
  quantity: number;
}

/**
 * POST /api/<business_slug>/cart/items/ — adding the same (product, variant)
 * pair twice increments the existing line's quantity server-side
 * (cart/views.py::CartItemViewSet.perform_create), never creates a
 * duplicate row. Stock is NOT checked here — only at checkout.
 */
export function addCartItem(accessToken: string, businessSlug: string, input: AddCartItemInput) {
  return apiFetch<CartItem>("cart/items/", { businessSlug, accessToken, method: "POST", body: input });
}

/**
 * PATCH /api/<business_slug>/cart/items/{id}/ — quantity only; the backend
 * rejects anything below 1 (cart/serializers.py::validate_quantity).
 */
export function updateCartItem(accessToken: string, businessSlug: string, itemId: number, quantity: number) {
  return apiFetch<CartItem>(`cart/items/${itemId}/`, {
    businessSlug,
    accessToken,
    method: "PATCH",
    body: { quantity },
  });
}

/** DELETE /api/<business_slug>/cart/items/{id}/ */
export function removeCartItem(accessToken: string, businessSlug: string, itemId: number) {
  return apiFetch<void>(`cart/items/${itemId}/`, { businessSlug, accessToken, method: "DELETE" });
}
