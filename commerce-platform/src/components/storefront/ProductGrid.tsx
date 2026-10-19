import type { Product } from "@/lib/api/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import type { ThemeConfig } from "@/lib/themes/types";
import { ProductCard } from "./ProductCard";

/**
 * Grid columns/gap come from `themeConfig.productGrid`, not a fixed class
 * list — the default theme's values (THEME_REGISTRY.default) are exactly
 * what this grid hardcoded before theming existed, so the fallback below
 * keeps every call site that hasn't been updated to pass a theme (and
 * every existing test) rendering identically.
 */
export function ProductGrid({
  products,
  storeSlug,
  themeConfig = THEME_REGISTRY.default,
  currency,
  returnPath,
}: {
  products: Product[];
  storeSlug: string;
  themeConfig?: ThemeConfig;
  currency?: string;
  returnPath?: string;
}) {
  const { columnsClassName, gapClassName } = themeConfig.productGrid;
  return (
    <div className={`grid ${columnsClassName} ${gapClassName}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          storeSlug={storeSlug}
          themeConfig={themeConfig}
          currency={currency}
          returnPath={returnPath}
        />
      ))}
    </div>
  );
}
