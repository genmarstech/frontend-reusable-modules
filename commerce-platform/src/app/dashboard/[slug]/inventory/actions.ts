"use server";

import { revalidatePath } from "next/cache";

import { ApiError, NetworkError } from "@/lib/api/client";
import {
  createCategory,
  createProduct,
  createVariant,
  deleteProductImage,
  deleteVariant,
  updateProduct,
  uploadProductImage,
} from "@/lib/api/catalog";
import { adjustInventory, createInventoryRecord, updateInventoryThreshold } from "@/lib/api/inventory";
import { requireAccessToken } from "@/lib/auth/requireAccessToken";
import { composeDescription } from "@/lib/products/descriptionFields";
import type { Category } from "@/lib/api/types";

/** Shared by createProductAction and updateProductAction — both forms submit the same four description fields. */
function descriptionFromFormData(formData: FormData): string {
  return composeDescription({
    material: String(formData.get("material") ?? "").trim(),
    fit: String(formData.get("fit") ?? "").trim(),
    care: String(formData.get("care") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  });
}

export interface InventoryActionResult {
  error?: string;
  success?: boolean;
}

export interface CategoryActionResult {
  error?: string;
  category?: Category;
}

export interface ImageActionResult {
  error?: string;
  success?: boolean;
}

export interface VariantActionResult {
  error?: string;
  success?: boolean;
}

/**
 * One file per submission, deliberately — the backend's own endpoint
 * (POST /product-images/) takes one `image` per request too (it's a
 * single ImageField, not a list), so a multi-file picker here would just
 * mean looping client-side; simpler to let a manager upload one, see it
 * land, upload the next.
 */
export async function uploadProductImageAction(
  _previousState: ImageActionResult,
  formData: FormData
): Promise<ImageActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const productId = Number(formData.get("productId"));
  const image = formData.get("image");

  if (!Number.isFinite(productId) || productId <= 0) return { error: "Missing product." };
  if (!(image instanceof File) || image.size === 0) return { error: "Choose an image file." };

  try {
    await uploadProductImage(accessToken, storeSlug, productId, image);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}

export async function deleteProductImageAction(storeSlug: string, imageId: number) {
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);
  await deleteProductImage(accessToken, storeSlug, imageId);
  revalidatePath(returnPath);
}

/**
 * Size, Colour, or any other dimension a business wants to sell by —
 * `name` is free text all the way down to catalog/models.py, not an enum,
 * so a fashion business isn't limited to a fixed list the way `care`/
 * `fit`/`material` above intentionally are not either.
 */
export async function createVariantAction(
  _previousState: VariantActionResult,
  formData: FormData
): Promise<VariantActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const productId = Number(formData.get("productId"));
  const name = String(formData.get("name") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const priceOverrideRaw = String(formData.get("priceOverride") ?? "").trim();

  if (!Number.isFinite(productId) || productId <= 0) return { error: "Missing product." };
  if (!name) return { error: "Enter a dimension — Size, Colour, or your own." };
  if (!value) return { error: "Enter a value, e.g. M or Red." };
  if (!sku) return { error: "Enter a SKU for this option." };
  if (priceOverrideRaw && (Number.isNaN(Number(priceOverrideRaw)) || Number(priceOverrideRaw) <= 0)) {
    return { error: "Price override must be greater than zero." };
  }

  try {
    await createVariant(accessToken, storeSlug, {
      product: productId,
      name,
      value,
      sku,
      price_override: priceOverrideRaw || null,
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}

export async function deleteVariantAction(storeSlug: string, variantId: number) {
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);
  await deleteVariant(accessToken, storeSlug, variantId);
  revalidatePath(returnPath);
}

/**
 * Lets a business's own manager create a category on the spot — same
 * "sandboxed, self-serve" reasoning as createProductAction below, since
 * before this a new category needed Django admin too, same gap as
 * products. Returns the created row (rather than just revalidating) so
 * the quick-add control next to the product form's category picker can
 * select it immediately, without waiting on a page re-render.
 */
export async function createCategoryAction(
  _previousState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter a category name." };

  let category: Category;
  try {
    category = await createCategory(accessToken, storeSlug, { name });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { category };
}

/**
 * The only path that changes `quantity` — always goes through
 * inventory.services.adjust_stock() on the backend (locks the row, refuses
 * to go negative, writes an append-only InventoryMovement). This action
 * never computes the resulting quantity itself; whatever the backend
 * returns is what's shown.
 */
export async function adjustStockAction(
  _previousState: InventoryActionResult,
  formData: FormData
): Promise<InventoryActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const recordId = String(formData.get("recordId"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const delta = Number(formData.get("delta"));
  const reason = String(formData.get("reason"));
  const note = String(formData.get("note") ?? "");

  if (!Number.isFinite(delta) || delta === 0) {
    return { error: "Enter a non-zero amount — positive to add stock, negative to remove it." };
  }

  try {
    await adjustInventory(accessToken, storeSlug, recordId, delta, reason, note);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}

/**
 * Creates a Product and its InventoryRecord as one step from this screen,
 * instead of leaving a manager to separately discover that a brand-new
 * product has no stock line at all — see InventoryRecordSerializer's
 * `quantity` being read-only even on create, which is why a non-zero
 * opening count still needs its own `adjust` call below.
 *
 * Three backend calls, each able to fail independently. A failure after
 * the product already exists is reported as a partial success (the
 * product is real and visible in this list) rather than retried
 * automatically — retrying createProduct blind would either collide on
 * the same SKU or silently create a duplicate product.
 */
export async function createProductAction(
  _previousState: InventoryActionResult,
  formData: FormData
): Promise<InventoryActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const description = descriptionFromFormData(formData);
  const categoryRaw = String(formData.get("category") ?? "");
  const category = categoryRaw ? Number(categoryRaw) : null;
  const publish = formData.get("publish") === "on";
  const initialQuantity = Number(formData.get("initialQuantity") ?? 0);
  const thresholdRaw = String(formData.get("lowStockThreshold") ?? "");
  const lowStockThreshold = thresholdRaw ? Number(thresholdRaw) : undefined;

  if (!name) return { error: "Enter a product name." };
  if (!sku) return { error: "Enter a SKU." };
  if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
    return { error: "Enter a price greater than zero." };
  }
  if (!Number.isFinite(initialQuantity) || initialQuantity < 0) {
    return { error: "Initial stock can't be negative." };
  }

  let product;
  try {
    product = await createProduct(accessToken, storeSlug, {
      name,
      sku,
      price,
      description,
      category,
      status: publish ? "published" : "draft",
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  let record;
  try {
    record = await createInventoryRecord(accessToken, storeSlug, {
      product: product.id,
      low_stock_threshold: lowStockThreshold,
    });
  } catch (error) {
    revalidatePath(returnPath);
    const message = error instanceof ApiError || error instanceof NetworkError ? error.message : "an unknown error";
    return { error: `"${product.name}" was created, but its inventory record failed (${message}). Add one below.` };
  }

  if (initialQuantity > 0) {
    try {
      await adjustInventory(accessToken, storeSlug, record.id, initialQuantity, "restock", "Initial stock on creation");
    } catch (error) {
      revalidatePath(returnPath);
      const message = error instanceof ApiError || error instanceof NetworkError ? error.message : "an unknown error";
      return { error: `"${product.name}" was created, but setting its opening stock failed (${message}). Adjust it below.` };
    }
  }

  revalidatePath(returnPath);
  return { success: true };
}

/**
 * The only way to change a product's name, description, SKU, price,
 * category or published state after createProductAction above has already
 * created it — createProduct's own fields (including description) were
 * writable from day one on the backend; this is what was missing on the
 * frontend to ever reach any of them again post-creation. A PATCH, not a
 * PUT — see catalog.ts::updateProduct — so a field this form doesn't
 * collect (there isn't one today) would stay untouched rather than get
 * silently cleared.
 */
export async function updateProductAction(
  _previousState: InventoryActionResult,
  formData: FormData
): Promise<InventoryActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);

  const productId = Number(formData.get("productId"));
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const description = descriptionFromFormData(formData);
  const categoryRaw = String(formData.get("category") ?? "");
  const category = categoryRaw ? Number(categoryRaw) : null;
  const publish = formData.get("publish") === "on";

  if (!Number.isFinite(productId) || productId <= 0) return { error: "Missing product." };
  if (!name) return { error: "Enter a product name." };
  if (!sku) return { error: "Enter a SKU." };
  if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
    return { error: "Enter a price greater than zero." };
  }

  try {
    await updateProduct(accessToken, storeSlug, productId, {
      name,
      sku,
      price,
      description,
      category,
      status: publish ? "published" : "draft",
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}

export async function updateThresholdAction(storeSlug: string, recordId: number, formData: FormData) {
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);
  const threshold = Number(formData.get("low_stock_threshold"));
  if (!Number.isFinite(threshold) || threshold < 0) return;

  await updateInventoryThreshold(accessToken, storeSlug, recordId, threshold);
  revalidatePath(returnPath);
}
