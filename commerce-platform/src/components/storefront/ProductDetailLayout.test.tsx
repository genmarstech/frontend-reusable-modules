import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Product } from "@/lib/api/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { ProductDetailLayout } from "./ProductDetailLayout";

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Men's Classic Fit Shirt",
    slug: "mens-classic-fit-shirt",
    description: "A shirt.",
    sku: "SKU-1",
    price: "1500.00",
    status: "published",
    category: null,
    images: [],
    variants: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("ProductDetailLayout", () => {
  it("renders the default theme's original, unthemed composition", () => {
    const html = renderToStaticMarkup(
      <ProductDetailLayout
        storeSlug="genmars-store"
        product={product({})}
        categoryName={null}
        themeConfig={THEME_REGISTRY.default}
      />
    );
    expect(html).toContain("Men&#x27;s Classic Fit Shirt");
    expect(html).toContain("A shirt.");
  });

  it("fashion's lookbook layout runs the description before the buy box, not after", () => {
    const html = renderToStaticMarkup(
      <ProductDetailLayout
        storeSlug="acme-fashion"
        product={product({ description: "Hand-finished linen." })}
        categoryName={null}
        themeConfig={THEME_REGISTRY.fashion}
      />
    );
    expect(html.indexOf("Hand-finished linen.")).toBeLessThan(html.indexOf("Add to cart"));
  });

  it("electronics' spec sheet lists SKU, category, and every real variant dimension", () => {
    const html = renderToStaticMarkup(
      <ProductDetailLayout
        storeSlug="circuit-city"
        product={product({
          sku: "PHN-128",
          variants: [
            { id: 1, product: 1, name: "Storage", value: "128GB", sku: "PHN-128", price_override: null, price: "1500.00" },
            { id: 2, product: 1, name: "Storage", value: "256GB", sku: "PHN-256", price_override: "1700.00", price: "1500.00" },
            { id: 3, product: 1, name: "Colour", value: "Black", sku: "PHN-128-BLK", price_override: null, price: "1500.00" },
          ],
        })}
        categoryName="Phones"
        themeConfig={THEME_REGISTRY.electronics}
      />
    );
    expect(html).toContain("PHN-128");
    expect(html).toContain("Phones");
    expect(html).toContain("128GB · 256GB");
    expect(html).toContain("Black");
  });

  it("electronics' spec sheet never fabricates a variant dimension the product doesn't have", () => {
    const html = renderToStaticMarkup(
      <ProductDetailLayout
        storeSlug="circuit-city"
        product={product({})}
        categoryName={null}
        themeConfig={THEME_REGISTRY.electronics}
      />
    );
    expect(html).not.toContain("Storage");
    expect(html).not.toContain("Colour");
  });

  it("grocery's quick-buy layout puts the buy box directly under the name, before the description", () => {
    const html = renderToStaticMarkup(
      <ProductDetailLayout
        storeSlug="fresh-mart"
        product={product({ description: "Picked this morning." })}
        categoryName={null}
        themeConfig={THEME_REGISTRY.grocery}
      />
    );
    expect(html.indexOf("Add to cart")).toBeLessThan(html.indexOf("Picked this morning."));
  });
});
