import "server-only";

import { apiFetch } from "./client";
import type { Address, Paginated } from "./types";

/**
 * GET /api/addresses/ — identity-scoped, no business slug (accounts/
 * views.py::AddressViewSet.get_queryset() filters by `user=request.user`
 * only). A saved address is not owned by any one business; the same
 * address can be picked at checkout for any store.
 */
export function listAddresses(accessToken: string) {
  return apiFetch<Paginated<Address>>("addresses/", { accessToken });
}
