"use client";

import { useActionState, useEffect } from "react";

import type { Category } from "@/lib/api/types";
import { createCategoryAction, type CategoryActionResult } from "./actions";

const initialState: CategoryActionResult = {};

/**
 * Sits beside NewProductForm's category <select>, not nested inside its
 * <form> — HTML forms can't nest, and this needs to submit (create a
 * category) independently of the product form around it. `onCreated`
 * is how the new row gets back into that select and gets picked as the
 * product's category, without waiting for the page's next server render.
 */
export function NewCategoryQuickAdd({
  storeSlug,
  onCreated,
}: {
  storeSlug: string;
  onCreated: (category: Category) => void;
}) {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);

  useEffect(() => {
    if (state.category) onCreated(state.category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.category]);

  return (
    <form action={formAction} className="mt-1 flex flex-wrap items-end gap-2">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input
        name="name"
        type="text"
        placeholder="New category name"
        className="w-40 rounded-md border border-neutral-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add category"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
