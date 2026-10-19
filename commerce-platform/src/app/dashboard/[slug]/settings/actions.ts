"use server";

import { revalidatePath } from "next/cache";

import { ApiError, NetworkError } from "@/lib/api/client";
import { updateOpsSettings } from "@/lib/api/ops/settings";
import { requireAccessToken } from "@/lib/auth/requireAccessToken";
import { isStoreTheme } from "@/lib/themes/types";

export interface SettingsActionResult {
  error?: string;
  success?: boolean;
}

export async function updateSettingsAction(
  _previousState: SettingsActionResult,
  formData: FormData
): Promise<SettingsActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/settings`;
  const accessToken = await requireAccessToken(returnPath);

  const currency = String(formData.get("currency") ?? "").trim().toUpperCase();
  const deliveryFee = String(formData.get("default_delivery_fee") ?? "").trim();
  const threshold = Number(formData.get("low_stock_default_threshold"));
  const theme = String(formData.get("theme") ?? "");

  if (!currency || currency.length !== 3) {
    return { error: "Currency must be a 3-letter code, e.g. KES." };
  }
  if (!Number.isFinite(threshold) || threshold < 0) {
    return { error: "Low stock threshold must be a non-negative number." };
  }
  // The radio group only ever submits one of STORE_THEMES's own values, so
  // this failing means the request didn't come from that form — rejected
  // here rather than forwarded to the backend as some other string
  // core/models.py::StoreSettings.Theme also happens to reject.
  if (!isStoreTheme(theme)) {
    return { error: "Choose one of the listed storefront designs." };
  }

  try {
    await updateOpsSettings(accessToken, storeSlug, {
      currency,
      default_delivery_fee: deliveryFee,
      low_stock_default_threshold: threshold,
      theme,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    if (error instanceof NetworkError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}
