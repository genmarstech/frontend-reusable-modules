"use client";

import type { Product, ProductVariant } from "@/lib/api/types";
import { PriceDisplay } from "./PriceDisplay";

/**
 * Only rendered when `product.variants.length > 0` — a product with no
 * variants shows just its own `price`, no picker at all, per the brief's
 * "variant selection only if the backend supports it" (ProductSerializer
 * always includes `variants`; most seeded products have none, so this is
 * the one piece of the storefront that needs real client interactivity:
 * the selected variant's price must update without a navigation).
 *
 * Variants are grouped by `name` (e.g. "Size", "Color") so more than one
 * variant dimension renders as more than one picker, each independently
 * selectable — `ProductVariant` has no dimension-grouping id of its own,
 * only a flat `name`/`value` pair, so `name` is the only thing to group by.
 *
 * Controlled, not self-owned state — `ProductBuyBox` (the parent) needs the
 * resolved single-dimension variant to pass on to `AddToCartForm`, and two
 * independent copies of "which variant is selected" (one here, one there)
 * would drift the moment either one changed without the other.
 */
export function VariantPicker({
  product,
  selected,
  onSelect,
  currency,
}: {
  product: Product;
  selected: Record<string, ProductVariant>;
  onSelect: (name: string, variant: ProductVariant) => void;
  currency?: string;
}) {
  const groups = groupByName(product.variants);

  // All variant groups must agree on one variant row to price against —
  // with more than one dimension there's no single ProductVariant that
  // represents "Size M + Color Red" together (the API models each
  // dimension as its own flat row, not a combination), so only the
  // single-dimension case can show a definite price; multi-dimension
  // shows the base product price as a safe "starting at" instead of
  // fabricating a combined one the backend never returned.
  const single = groups.length === 1 ? Object.values(selected)[0] : undefined;
  const price = single ? single.price_override ?? single.price : product.price;

  return (
    <div className="space-y-4">
      {groups.map(([name, variants]) => (
        <div key={name} className="rounded-md border border-neutral-200 p-3">
          <p className="text-sm font-medium text-neutral-700">
            {name} <span className="font-normal text-neutral-400">({variants.length})</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelect(name, variant)}
                aria-pressed={selected[name]?.id === variant.id}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  selected[name]?.id === variant.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                {variant.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <PriceDisplay amount={price} currency={currency} prefix={groups.length > 1 ? "Starting at" : undefined} />
    </div>
  );
}

export function groupByName(variants: ProductVariant[]): [string, ProductVariant[]][] {
  const map = new Map<string, ProductVariant[]>();
  for (const variant of variants) {
    const group = map.get(variant.name);
    if (group) {
      group.push(variant);
    } else {
      map.set(variant.name, [variant]);
    }
  }
  return Array.from(map.entries());
}
