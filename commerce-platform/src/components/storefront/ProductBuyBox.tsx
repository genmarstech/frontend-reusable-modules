"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import type { ThemeConfig } from "@/lib/themes/types";
import { AddToCartForm } from "./AddToCartForm";
import { VariantPicker, groupByName } from "./VariantPicker";

/**
 * Owns the one piece of state a product page needs across two otherwise
 * independent components: which variant is selected determines both the
 * price VariantPicker shows and the `variantId` AddToCartForm submits.
 */
export function ProductBuyBox({
  storeSlug,
  product,
  currency,
  themeConfig = THEME_REGISTRY.default,
}: {
  storeSlug: string;
  product: Product;
  currency?: string;
  themeConfig?: ThemeConfig;
}) {
  const groups = groupByName(product.variants);
  const [selected, setSelected] = useState<Record<string, ProductVariant>>(() => {
    const initial: Record<string, ProductVariant> = {};
    for (const [name, variants] of groups) {
      initial[name] = variants[0];
    }
    return initial;
  });

  if (groups.length === 0) {
    return (
      <div className="space-y-4">
        <p className={`text-xl font-semibold ${themeConfig.accentTextClassName}`}>
          {formatMoney(product.price, currency)}
        </p>
        <AddToCartForm
          storeSlug={storeSlug}
          productId={product.id}
          accentClassName={`${themeConfig.accentBgClassName} hover:opacity-90`}
        />
      </div>
    );
  }

  // A CartItem can only carry ONE ProductVariant FK (cart/models.py) — a
  // product with more than one variant dimension (Size AND Color) has no
  // single row that represents a chosen combination of both, so there is no
  // honest `variantId` to submit here. Showing the pickers is still useful
  // (it's real product data), just without a working "add to cart" under
  // them — inventing a combination the backend has no row for would be
  // worse than admitting the gap.
  const single = groups.length === 1 ? Object.values(selected)[0] : undefined;

  return (
    <div className="space-y-4">
      <VariantPicker
        product={product}
        selected={selected}
        onSelect={(name, variant) => setSelected((prev) => ({ ...prev, [name]: variant }))}
        currency={currency}
      />
      {groups.length > 1 ? (
        <p className="text-sm text-neutral-500">
          This product&apos;s options can&apos;t yet be combined into a single orderable item —
          contact the store directly to order it.
        </p>
      ) : (
        <AddToCartForm
          storeSlug={storeSlug}
          productId={product.id}
          variantId={single?.id}
          accentClassName={`${themeConfig.accentBgClassName} hover:opacity-90`}
        />
      )}
    </div>
  );
}
