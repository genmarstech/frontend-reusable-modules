"use client";

import { useActionState } from "react";

import { uploadProductImageAction, type ImageActionResult } from "./actions";

const initialState: ImageActionResult = {};

export function ProductImageUpload({ storeSlug, productId }: { storeSlug: string; productId: number }) {
  const [state, formAction, pending] = useActionState(uploadProductImageAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 text-xs">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="productId" value={productId} />
      <input type="file" name="image" accept="image/*" required className="text-xs" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-2 py-1 font-medium disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Add image"}
      </button>
      {state.error && <span className="text-red-600">{state.error}</span>}
    </form>
  );
}
