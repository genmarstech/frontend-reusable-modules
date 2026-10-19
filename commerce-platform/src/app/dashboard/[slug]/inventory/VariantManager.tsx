"use client";

import { useActionState, useState } from "react";

import type { Product } from "@/lib/api/types";
import { groupByName } from "@/components/storefront/VariantPicker";
import { createVariantAction, deleteVariantAction, type VariantActionResult } from "./actions";

const initialState: VariantActionResult = {};

/**
 * Size, Colour — or any other dimension, since ProductVariant.name is free
 * text on the backend, not an enum (catalog/models.py). Add-and-remove
 * only, same scope as ProductImageManager right above it: changing an
 * existing option's value is "remove it, add the corrected one" rather
 * than an in-place edit, since a variant carries its own sku and optional
 * price override — closer to its own small row than a text field.
 */
export function VariantManager({ storeSlug, product }: { storeSlug: string; product: Product }) {
  const [state, formAction, pending] = useActionState(createVariantAction, initialState);
  const [open, setOpen] = useState(false);
  const groups = groupByName(product.variants);

  return (
    <div className="mt-2 space-y-2 text-xs">
      {groups.length > 0 && (
        <div className="space-y-1">
          {groups.map(([name, variants]) => (
            <div key={name} className="flex flex-wrap items-center gap-1">
              <span className="font-medium text-neutral-600">{name}:</span>
              {variants.map((variant) => (
                <form key={variant.id} action={deleteVariantAction.bind(null, storeSlug, variant.id)}>
                  <button
                    type="submit"
                    title={`Remove ${name} ${variant.value}`}
                    className="rounded-full border border-neutral-300 px-2 py-0.5 text-neutral-700 hover:border-red-300 hover:text-red-700"
                  >
                    {variant.value} ×
                  </button>
                </form>
              ))}
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="font-medium text-neutral-500 underline">
          + Add size / colour / option
        </button>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-2">
          <input type="hidden" name="storeSlug" value={storeSlug} />
          <input type="hidden" name="productId" value={product.id} />

          <div>
            <label htmlFor={`variant-name-${product.id}`} className="block text-neutral-500">
              Dimension
            </label>
            <input
              id={`variant-name-${product.id}`}
              name="name"
              placeholder="Size, Colour…"
              required
              list={`variant-names-${product.id}`}
              className="mt-1 w-28 rounded-md border border-neutral-300 px-2 py-1"
            />
            <datalist id={`variant-names-${product.id}`}>
              {groups.map(([name]) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor={`variant-value-${product.id}`} className="block text-neutral-500">
              Value
            </label>
            <input
              id={`variant-value-${product.id}`}
              name="value"
              placeholder="M, Red…"
              required
              className="mt-1 w-24 rounded-md border border-neutral-300 px-2 py-1"
            />
          </div>
          <div>
            <label htmlFor={`variant-sku-${product.id}`} className="block text-neutral-500">
              SKU
            </label>
            <input
              id={`variant-sku-${product.id}`}
              name="sku"
              required
              className="mt-1 w-28 rounded-md border border-neutral-300 px-2 py-1"
            />
          </div>
          <div>
            <label htmlFor={`variant-price-${product.id}`} className="block text-neutral-500">
              Price override
            </label>
            <input
              id={`variant-price-${product.id}`}
              name="priceOverride"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={product.price}
              className="mt-1 w-28 rounded-md border border-neutral-300 px-2 py-1"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 underline">
            Cancel
          </button>
          {state.error && <span className="w-full text-red-600">{state.error}</span>}
        </form>
      )}
    </div>
  );
}
