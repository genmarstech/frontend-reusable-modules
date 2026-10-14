"use server";

import { redirect } from "next/navigation";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import type { Order } from "@/lib/types";

export interface CheckoutState {
  error: string | null;
}

export async function submitCheckout(_prevState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const addressId = formData.get("address_id");

  const payload: Record<string, unknown> =
    addressId && addressId !== "new"
      ? { address_id: Number(addressId) }
      : {
          delivery_recipient_name: formData.get("delivery_recipient_name"),
          delivery_line1: formData.get("delivery_line1"),
          delivery_line2: formData.get("delivery_line2") || "",
          delivery_city: formData.get("delivery_city"),
          delivery_phone: formData.get("delivery_phone"),
        };

  payload.contact_phone = formData.get("contact_phone") || "";

  let order: Order;
  try {
    order = await djangoFetch<Order>("/api/checkout/", { method: "POST", body: payload });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.body.detail ?? "Checkout failed. Check your details and try again." };
    }
    return { error: "Could not reach the server. Try again." };
  }

  // Routed by numeric id, not reference — the customer-facing Orders API
  // has no lookup-by-reference filter (see the frontend plan's gap #2), and
  // the response here already hands us the id for free. The reference is
  // still what's shown to the customer on the page itself.
  redirect(`/checkout/${order.id}/pay`);
}
