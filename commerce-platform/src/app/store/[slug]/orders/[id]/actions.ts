"use server";

import { revalidatePath } from "next/cache";

import { ApiError, NetworkError } from "@/lib/api/client";
import { cancelOrder } from "@/lib/api/orders";
import { initiateMpesaPayment } from "@/lib/api/payments";
import { clearSessionAndRedirectToLogin, requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface OrderActionResult {
  error?: string;
  success?: boolean;
}

/**
 * The backend itself is the authority on whether this order can still be
 * self-cancelled (orders/views.py::CUSTOMER_CANCELLABLE) — the page only
 * shows this control for the same two statuses as a UI convenience; this
 * action's own error branch is what actually carries a refusal, not a
 * client-side guess duplicating the backend's rule.
 */
export async function cancelOrderAction(
  _previousState: OrderActionResult,
  formData: FormData
): Promise<OrderActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const orderId = String(formData.get("orderId"));
  const returnPath = `/store/${storeSlug}/orders/${orderId}`;
  const accessToken = await requireAccessToken(returnPath);

  try {
    await cancelOrder(accessToken, storeSlug, orderId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionAndRedirectToLogin(returnPath);
    }
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    if (error instanceof NetworkError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(returnPath);
  revalidatePath(`/store/${storeSlug}/orders`);
  return { success: true };
}

export interface PaymentActionResult {
  error?: string;
  message?: string;
}

/**
 * This only ever asks Safaricom to prompt the phone — it can never itself
 * mark anything paid (payments/mpesa.py's own stated rule; only the
 * callback, server-to-server, does that). `revalidatePath` here is so the
 * order's own page picks up a `Payment` row existing at all on next load,
 * not because this action changed the order's status — it didn't, and
 * can't.
 */
export async function initiatePaymentAction(
  _previousState: PaymentActionResult,
  formData: FormData
): Promise<PaymentActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const orderId = String(formData.get("orderId"));
  const orderReference = String(formData.get("orderReference"));
  const phone = String(formData.get("phone") ?? "").trim();
  const returnPath = `/store/${storeSlug}/orders/${orderId}`;
  const accessToken = await requireAccessToken(returnPath);

  if (!phone) {
    return { error: "Enter the phone number to send the M-Pesa prompt to." };
  }

  try {
    await initiateMpesaPayment(accessToken, storeSlug, { order_reference: orderReference, phone });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionAndRedirectToLogin(returnPath);
    }
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    if (error instanceof NetworkError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(returnPath);
  return { message: "Sent. Check your phone to complete the payment." };
}
