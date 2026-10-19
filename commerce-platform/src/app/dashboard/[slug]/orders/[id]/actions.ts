"use server";

import { revalidatePath } from "next/cache";

import { ApiError, NetworkError } from "@/lib/api/client";
import { transitionOpsOrder } from "@/lib/api/ops/orders";
import { requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface TransitionActionResult {
  error?: string;
  success?: boolean;
}

/**
 * The backend's own ALLOWED_TRANSITIONS (orders/services.py) is the real
 * authority on what's possible from the order's current status — this
 * action only forwards whatever the form submitted and surfaces whatever
 * the backend says, never guesses client-side.
 */
export async function transitionOrderAction(
  _previousState: TransitionActionResult,
  formData: FormData
): Promise<TransitionActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const orderId = String(formData.get("orderId"));
  const toStatus = String(formData.get("toStatus"));
  const note = String(formData.get("note") ?? "");
  const returnPath = `/dashboard/${storeSlug}/orders/${orderId}`;
  const accessToken = await requireAccessToken(returnPath);

  try {
    await transitionOpsOrder(accessToken, storeSlug, orderId, toStatus, note);
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
  revalidatePath(`/dashboard/${storeSlug}/orders`);
  return { success: true };
}
