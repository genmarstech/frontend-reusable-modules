"use server";

import { revalidatePath } from "next/cache";

import { ApiError, NetworkError } from "@/lib/api/client";
import { createProduct } from "@/lib/api/catalog";
import { adjustInventory, createInventoryRecord, updateInventoryThreshold } from "@/lib/api/inventory";
import { requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface InventoryActionResult {
  error?: string;
  success?: boolean;
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

export async function updateThresholdAction(storeSlug: string, recordId: number, formData: FormData) {
  const returnPath = `/dashboard/${storeSlug}/inventory`;
  const accessToken = await requireAccessToken(returnPath);
  const threshold = Number(formData.get("low_stock_threshold"));
  if (!Number.isFinite(threshold) || threshold < 0) return;

  await updateInventoryThreshold(accessToken, storeSlug, recordId, threshold);
  revalidatePath(returnPath);
}
