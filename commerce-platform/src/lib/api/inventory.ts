import "server-only";

import { apiFetch } from "./client";
import type { InventoryMovement, InventoryRecord, Paginated } from "./types";

/**
 * `/api/<business_slug>/inventory/...` — lives on the storefront tree, not
 * `/api/ops/<slug>/...` (inventory/urls.py is included alongside catalog's
 * own urls in config/urls.py), even though every action here still needs
 * an active BusinessMembership (inventory/views.py's own permission
 * classes, not this app's business). Read: any member. Write/adjust: see
 * each function below.
 */
export function listInventory(accessToken: string, businessSlug: string, search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Paginated<InventoryRecord>>(`inventory/${qs}`, { businessSlug, accessToken });
}

export function updateInventoryThreshold(
  accessToken: string,
  businessSlug: string,
  id: number | string,
  lowStockThreshold: number
) {
  return apiFetch<InventoryRecord>(`inventory/${id}/`, {
    businessSlug,
    accessToken,
    method: "PATCH",
    body: { low_stock_threshold: lowStockThreshold },
  });
}

/** POST /api/<slug>/inventory/{id}/adjust/ — the only path that changes
 * `quantity`; always goes through adjust_stock() and leaves an
 * InventoryMovement behind (inventory/services.py). */
export function adjustInventory(
  accessToken: string,
  businessSlug: string,
  id: number | string,
  delta: number,
  reason: string,
  note?: string
) {
  return apiFetch<InventoryRecord>(`inventory/${id}/adjust/`, {
    businessSlug,
    accessToken,
    method: "POST",
    body: { delta, reason, note },
  });
}

export function listInventoryMovements(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<InventoryMovement[]>(`inventory/${id}/movements/`, { businessSlug, accessToken });
}

/**
 * POST /api/<slug>/inventory/ — owner/manager only
 * (inventory/views.py::InventoryRecordViewSet, `_MANAGER_ONLY_ACTIONS`).
 * `quantity` is read-only on the serializer even here — this only gives a
 * product (or variant) a stock LINE, starting at 0; adjustInventory() above
 * is the one path that ever sets a real count.
 */
export function createInventoryRecord(
  accessToken: string,
  businessSlug: string,
  data: { product?: number; variant?: number; low_stock_threshold?: number }
) {
  return apiFetch<InventoryRecord>("inventory/", {
    businessSlug,
    accessToken,
    method: "POST",
    body: data,
  });
}
