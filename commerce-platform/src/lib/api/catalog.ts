import "server-only";

import { apiFetch } from "./client";
import type { Category, Paginated, Product, ProductImage } from "./types";

/**
 * GET /api/<business_slug>/products/ — anonymous-readable, published-only
 * for a caller with no membership in that business (catalog/views.py::
 * ProductViewSet.get_queryset()). Verified live — see docs/API_CONTRACT.md.
 *
 * `accessToken` is optional and omitted entirely on the public storefront
 * page — passing one there would still only return published products
 * anyway (get_queryset() checks caller_role(), not just "logged in"), but
 * omitting it keeps that call honestly anonymous. The ops/inventory side
 * passes one so a draft product resolves to its real name instead of
 * falling back to "Product #<id>".
 *
 * `page_size` is deliberately never sent — confirmed live this phase that
 * the backend doesn't honor it (PageNumberPagination.page_size_query_param
 * is unset); every page is always 20 results, full stop.
 */
export function listProducts(businessSlug: string, params?: Record<string, string>, accessToken?: string) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiFetch<Paginated<Product>>(`products/${query}`, { businessSlug, accessToken });
}

/**
 * GET /api/<business_slug>/products/{id}/ — keyed by numeric id, not slug.
 * Two different businesses' products can share the identical slug
 * (confirmed live, see docs/API_CONTRACT.md), which is exactly why this
 * isn't a slug-based route.
 */
export function getProduct(businessSlug: string, id: number | string) {
  return apiFetch<Product>(`products/${id}/`, { businessSlug });
}

/**
 * GET /api/<business_slug>/categories/ — `category` on a Product is a bare
 * id; this is the only way to turn it into a name.
 */
export function listCategories(businessSlug: string) {
  return apiFetch<Paginated<Category>>("categories/", { businessSlug });
}

/**
 * POST /api/<business_slug>/products/ — owner/manager only
 * (catalog/views.py::ProductViewSet, `IsBusinessManagerOrReadOnly`).
 * `slug` is read-only on the serializer (auto-derived from `name` on
 * save), so it's never sent here. Starts with no inventory record at
 * all — inventory.ts::createInventoryRecord is the separate call that
 * gives it a stock line.
 */
export function createProduct(
  accessToken: string,
  businessSlug: string,
  data: {
    name: string;
    sku: string;
    price: string;
    description?: string;
    category?: number | null;
    status?: "draft" | "published" | "archived";
  }
) {
  return apiFetch<Product>("products/", {
    businessSlug,
    accessToken,
    method: "POST",
    body: data,
  });
}

/**
 * POST /api/<business_slug>/categories/ — owner/manager only
 * (catalog/views.py::CategoryViewSet, `IsBusinessManagerOrReadOnly`).
 * `slug` is read-only (auto-derived from `name`); `name` is unique per
 * business on the backend (CategorySerializer.validate_name), so a
 * clashing name comes back as a normal field error, not a 500.
 */
export function createCategory(accessToken: string, businessSlug: string, data: { name: string; parent?: number | null }) {
  return apiFetch<Category>("categories/", {
    businessSlug,
    accessToken,
    method: "POST",
    body: data,
  });
}

/**
 * POST /api/<business_slug>/product-images/ — owner/manager only
 * (catalog/views.py::ProductImageViewSet). Multipart, not JSON — `image`
 * is a real file, so this is built as `FormData`; apiFetch() skips its
 * usual JSON content-type/stringify step for that case so fetch can set
 * its own multipart boundary (see client.ts's own comment on why).
 */
export function uploadProductImage(
  accessToken: string,
  businessSlug: string,
  productId: number,
  image: File,
  sortOrder?: number
) {
  const form = new FormData();
  form.append("product", String(productId));
  form.append("image", image);
  if (sortOrder !== undefined) form.append("sort_order", String(sortOrder));
  return apiFetch<ProductImage>("product-images/", {
    businessSlug,
    accessToken,
    method: "POST",
    body: form,
  });
}

/** DELETE /api/<business_slug>/product-images/{id}/ — owner/manager only. */
export function deleteProductImage(accessToken: string, businessSlug: string, id: number | string) {
  return apiFetch<void>(`product-images/${id}/`, { businessSlug, accessToken, method: "DELETE" });
}
