"use server";

import { redirect } from "next/navigation";

import { ApiError, NetworkError } from "@/lib/api/client";
import { checkout, type CheckoutInput } from "@/lib/api/orders";
import { clearSessionAndRedirectToLogin, requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface CheckoutActionResult {
  error?: string;
}

/**
 * All pricing/stock re-validation happens server-side inside
 * orders/services.py::create_order_from_cart() — this only assembles
 * whichever shape of `CheckoutSerializer` input the form submitted and
 * surfaces whatever the backend decides (insufficient stock, a now-
 * unavailable product, an empty cart) as the same inline error a field-
 * validation failure would show, never a hard crash to the error boundary.
 */
export async function submitCheckoutAction(
  _previousState: CheckoutActionResult,
  formData: FormData
): Promise<CheckoutActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/store/${storeSlug}/checkout`;
  const accessToken = await requireAccessToken(returnPath);

  const mode = formData.get("mode");
  const contactPhone = String(formData.get("contact_phone") ?? "").trim();

  let input: CheckoutInput;
  if (mode === "address") {
    const addressId = Number(formData.get("address_id"));
    if (!Number.isFinite(addressId)) {
      return { error: "Choose a saved address." };
    }
    input = { address_id: addressId, contact_phone: contactPhone || undefined };
  } else {
    const recipient = String(formData.get("delivery_recipient_name") ?? "").trim();
    const line1 = String(formData.get("delivery_line1") ?? "").trim();
    const city = String(formData.get("delivery_city") ?? "").trim();
    const phone = String(formData.get("delivery_phone") ?? "").trim();
    if (!recipient || !line1 || !city || !phone) {
      return { error: "Fill in recipient name, address line 1, city and delivery phone." };
    }
    input = {
      delivery_recipient_name: recipient,
      delivery_line1: line1,
      delivery_line2: String(formData.get("delivery_line2") ?? "").trim() || undefined,
      delivery_city: city,
      delivery_phone: phone,
      contact_phone: contactPhone || undefined,
    };
  }

  let order;
  try {
    order = await checkout(accessToken, storeSlug, input);
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

  redirect(`/store/${storeSlug}/orders/${order.id}`);
}
