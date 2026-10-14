"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import { readableErrorMessage } from "@/lib/errors";

export async function transitionOrder(orderId: number, toStatus: string, note = ""): Promise<{ error: string | null }> {
  try {
    await djangoFetch(`/api/ops/orders/${orderId}/transition/`, { method: "POST", body: { to_status: toStatus, note } });
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? readableErrorMessage(error.body, "Could not update this order.") : "Could not reach the server.",
    };
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { error: null };
}
