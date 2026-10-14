"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";

export async function cancelOrder(orderId: number): Promise<{ error: string | null }> {
  try {
    await djangoFetch(`/api/orders/${orderId}/cancel/`, { method: "POST" });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.body.detail ?? "Could not cancel this order." };
    }
    return { error: "Could not reach the server." };
  }
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { error: null };
}
