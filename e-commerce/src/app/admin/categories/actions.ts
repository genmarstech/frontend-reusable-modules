"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import { readableErrorMessage } from "@/lib/errors";

export interface ActionState {
  error: string | null;
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await djangoFetch("/api/categories/", {
      method: "POST",
      body: { name: formData.get("name"), parent: formData.get("parent") || null },
    });
  } catch (error) {
    return {
      error: error instanceof ApiRequestError ? readableErrorMessage(error.body, "Could not create category.") : "Could not reach the server.",
    };
  }
  revalidatePath("/admin/categories");
  return { error: null };
}

export async function deleteCategory(id: number) {
  await djangoFetch(`/api/categories/${id}/`, { method: "DELETE" });
  revalidatePath("/admin/categories");
}
