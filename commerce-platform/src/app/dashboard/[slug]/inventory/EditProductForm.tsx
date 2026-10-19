"use client";

import { useActionState, useState } from "react";

import type { Category, Product } from "@/lib/api/types";
import { updateProductAction, type InventoryActionResult } from "./actions";

const initialState: InventoryActionResult = {};

/**
 * Collapsed by default on every row — a manager editing one product
 * shouldn't scroll past every other product's open edit form to find it.
 * Unlike NewProductForm, every field starts from the product's own current
 * value (`defaultValue`, uncontrolled) rather than blank: this is the only
 * place a product's description, name, SKU, price or category can be
 * changed once createProductAction has already created it — see
 * updateProductAction's own comment on why that gap existed at all.
 */
export function EditProductForm({
  storeSlug,
  product,
  categories,
}: {
  storeSlug: string;
  product: Product;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(updateProductAction, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-neutral-500 underline"
      >
        Edit details
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-md border border-neutral-200 p-3 text-xs">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="productId" value={product.id} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`name-${product.id}`} className="block text-neutral-500">
            Name
          </label>
          <input
            id={`name-${product.id}`}
            name="name"
            defaultValue={product.name}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor={`sku-${product.id}`} className="block text-neutral-500">
            SKU
          </label>
          <input
            id={`sku-${product.id}`}
            name="sku"
            defaultValue={product.sku}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor={`price-${product.id}`} className="block text-neutral-500">
            Price
          </label>
          <input
            id={`price-${product.id}`}
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={product.price}
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor={`category-${product.id}`} className="block text-neutral-500">
            Category
          </label>
          <select
            id={`category-${product.id}`}
            name="category"
            defaultValue={product.category ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`description-${product.id}`} className="block text-neutral-500">
          Description
        </label>
        <textarea
          id={`description-${product.id}`}
          name="description"
          defaultValue={product.description}
          rows={3}
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>

      <label className="flex items-center gap-2 text-neutral-600">
        <input type="checkbox" name="publish" defaultChecked={product.status === "published"} />
        Published (visible on the storefront)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 underline">
          Cancel
        </button>
        {state.error && <span className="text-red-600">{state.error}</span>}
        {state.success && <span className="text-green-700">Saved.</span>}
      </div>
    </form>
  );
}
