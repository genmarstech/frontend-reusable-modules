"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";

export interface ActionState {
  error: string | null;
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await djangoFetch("/api/me/", {
      method: "PATCH",
      body: {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        phone_number: formData.get("phone_number"),
      },
    });
  } catch (error) {
    return { error: error instanceof ApiRequestError ? (error.body.detail ?? "Could not update profile.") : "Could not reach the server." };
  }
  revalidatePath("/account");
  return { error: null };
}

export async function saveAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = formData.get("id");
  const payload = {
    label: formData.get("label") || "",
    recipient_name: formData.get("recipient_name"),
    phone_number: formData.get("phone_number"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || "",
    city: formData.get("city"),
    is_default: formData.get("is_default") === "on",
  };

  try {
    if (id) {
      await djangoFetch(`/api/addresses/${id}/`, { method: "PATCH", body: payload });
    } else {
      await djangoFetch("/api/addresses/", { method: "POST", body: payload });
    }
  } catch (error) {
    return { error: error instanceof ApiRequestError ? (error.body.detail ?? "Could not save address.") : "Could not reach the server." };
  }
  revalidatePath("/account");
  return { error: null };
}

export async function deleteAddress(id: number) {
  await djangoFetch(`/api/addresses/${id}/`, { method: "DELETE" });
  revalidatePath("/account");
}
