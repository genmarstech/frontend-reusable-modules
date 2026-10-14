"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch } from "@/lib/django";

export async function updateCartItemQuantity(itemId: number, quantity: number) {
  if (quantity < 1) {
    await removeCartItem(itemId);
    return;
  }
  await djangoFetch(`/api/cart/items/${itemId}/`, { method: "PATCH", body: { quantity } });
  revalidatePath("/cart");
}

export async function removeCartItem(itemId: number) {
  await djangoFetch(`/api/cart/items/${itemId}/`, { method: "DELETE" });
  revalidatePath("/cart");
}
