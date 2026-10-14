"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import { readableErrorMessage } from "@/lib/errors";

export interface ActionState {
  error: string | null;
}

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await djangoFetch("/api/ops/settings/", {
      method: "PATCH",
      body: {
        currency: formData.get("currency"),
        default_delivery_fee: formData.get("default_delivery_fee"),
        low_stock_default_threshold: Number(formData.get("low_stock_default_threshold")),
      },
    });
  } catch (error) {
    return { error: error instanceof ApiRequestError ? readableErrorMessage(error.body, "Could not save settings.") : "Could not reach the server." };
  }
  revalidatePath("/admin/settings");
  return { error: null };
}
