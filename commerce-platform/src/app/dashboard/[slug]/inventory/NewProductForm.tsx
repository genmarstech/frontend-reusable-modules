"use client";

import { useActionState, useState } from "react";

import type { Category } from "@/lib/api/types";
import { createProductAction } from "./actions";
import type { InventoryActionResult } from "./actions";
import { NewCategoryQuickAdd } from "./NewCategoryQuickAdd";

const initialState: InventoryActionResult = {};

/**
 * Lives on the Inventory screen on purpose, not a separate "Products"
 * page — creating a product with no stock line is the exact gap this
 * form closes (see createProductAction), so the two happen as one
 * submission a manager never has to remember to split in two.
 *
 * The category picker (and its "+ Add category" quick-add) sits OUTSIDE
 * this component's own <form> — NewCategoryQuickAdd is itself a <form>,
 * and HTML forms can't nest. The chosen category id instead rides into
 * this form through a hidden input kept in sync with `categoryValue`.
 */
export function NewProductForm({ storeSlug, categories }: { storeSlug: string; categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createProductAction, initialState);
  const [open, setOpen] = useState(false);
  // Seeded once from the server-fetched list, then grown locally as
  // NewCategoryQuickAdd creates rows — not re-synced from the `categories`
  // prop afterward, so a category created here doesn't wait on this page's
  // next server render (and doesn't risk showing up twice once it does).
  const [categoryOptions, setCategoryOptions] = useState<Category[]>(categories);
  const [categoryValue, setCategoryValue] = useState("");

  function handleCategoryCreated(category: Category) {
    setCategoryOptions((prev) => (prev.some((c) => c.id === category.id) ? prev : [...prev, category]));
    setCategoryValue(String(category.id));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium"
      >
        + New product
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New product</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500 underline">
          Cancel
        </button>
      </div>

      <div>
        <label htmlFor="category" className="block text-xs text-neutral-500">
          Category (optional)
        </label>
        <select
          id="category"
          value={categoryValue}
          onChange={(e) => setCategoryValue(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
        >
          <option value="">No category</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <NewCategoryQuickAdd storeSlug={storeSlug} onCreated={handleCategoryCreated} />
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="storeSlug" value={storeSlug} />
        <input type="hidden" name="category" value={categoryValue} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="block text-xs text-neutral-500">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-xs text-neutral-500">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-xs text-neutral-500">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="initialQuantity" className="block text-xs text-neutral-500">
              Opening stock
            </label>
            <input
              id="initialQuantity"
              name="initialQuantity"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="lowStockThreshold" className="block text-xs text-neutral-500">
              Low stock threshold (optional)
            </label>
            <input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              step="1"
              placeholder="business default"
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="material" className="block text-xs text-neutral-500">
              🧵 Material
            </label>
            <input
              id="material"
              name="material"
              type="text"
              placeholder="100% Cotton"
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="fit" className="block text-xs text-neutral-500">
              📏 Fit
            </label>
            <input
              id="fit"
              name="fit"
              type="text"
              placeholder="Regular fit"
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="care" className="block text-xs text-neutral-500">
              🧺 Care
            </label>
            <input
              id="care"
              name="care"
              type="text"
              placeholder="Machine wash cold"
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs text-neutral-500">
            Description (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Anything else a customer should know."
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" name="publish" />
          Publish immediately (otherwise saved as a draft, hidden from the storefront)
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create product"}
          </button>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          {state.success && <p className="text-xs text-green-700">Created.</p>}
        </div>
      </form>
    </div>
  );
}
