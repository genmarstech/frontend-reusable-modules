"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";

export interface ActionState {
  error: string | null;
}

function payloadFrom(formData: FormData) {
  return {
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description") || "",
    price: formData.get("price"),
    status: formData.get("status"),
    category: formData.get("category") ? Number(formData.get("category")) : null,
  };
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await djangoFetch("/api/products/", { method: "POST", body: payloadFrom(formData) });
  } catch (error) {
    return { error: error instanceof ApiRequestError ? (error.body.detail ?? "Could not create product.") : "Could not reach the server." };
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await djangoFetch(`/api/products/${productId}/`, { method: "PATCH", body: payloadFrom(formData) });
  } catch (error) {
    return { error: error instanceof ApiRequestError ? (error.body.detail ?? "Could not update product.") : "Could not reach the server." };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect("/admin/products");
}
