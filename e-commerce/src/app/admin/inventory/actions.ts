"use server";

import { revalidatePath } from "next/cache";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import { readableErrorMessage } from "@/lib/errors";

export async function adjustStock(
  recordId: number,
  delta: number,
  reason: string,
  note: string,
): Promise<{ error: string | null }> {
  try {
    await djangoFetch(`/api/inventory/${recordId}/adjust/`, { method: "POST", body: { delta, reason, note } });
  } catch (error) {
    return { error: error instanceof ApiRequestError ? readableErrorMessage(error.body, "Could not adjust stock.") : "Could not reach the server." };
  }
  revalidatePath("/admin/inventory");
  return { error: null };
}
