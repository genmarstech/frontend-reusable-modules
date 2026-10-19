import "server-only";

import { apiFetch } from "./client";
import type { PublicStoreInfo } from "./types";

/**
 * GET /api/<business_slug>/store/ — anonymous-readable, 404s on an
 * unknown/suspended slug exactly like /products/ (core/views.py::
 * PublicStoreInfoView). The one place a business's real display name,
 * currency and storefront theme reach this app — see docs/API_CONTRACT.md's
 * "No public business-detail endpoint" section for why this exists.
 */
export function getStoreInfo(businessSlug: string) {
  return apiFetch<PublicStoreInfo>("store/", { businessSlug });
}
