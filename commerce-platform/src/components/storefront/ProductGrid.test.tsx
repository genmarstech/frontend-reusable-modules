import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Product } from "@/lib/api/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import { ProductGrid } from "./ProductGrid";

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Test product",
    slug: "test-product",
    description: "",
    sku: "SKU-1",
    price: "1000.00",
    status: "published",
    category: null,
    images: [],
    variants: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("ProductGrid", () => {
  it("renders one card per product, each linking to its own storefront detail route", () => {
    const html = renderToStaticMarkup(
      <ProductGrid
        storeSlug="genmars-store"
        products={[product({ id: 1, name: "Men's Classic Fit Shirt" }), product({ id: 2, name: "Canvas Tote" })]}
      />
    );
    expect(html).toContain("Men&#x27;s Classic Fit Shirt");
    expect(html).toContain("Canvas Tote");
    expect(html).toContain('href="/store/genmars-store/products/1"');
    expect(html).toContain('href="/store/genmars-store/products/2"');
  });

  it("shows the placeholder, not a broken image, for a product with no images", () => {
    const html = renderToStaticMarkup(
      <ProductGrid storeSlug="genmars-store" products={[product({ images: [] })]} />
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("svg");
  });

  it("formats price digits without inventing a currency symbol when none is given", () => {
    const html = renderToStaticMarkup(<ProductGrid storeSlug="genmars-store" products={[product({ price: "1999.50" })]} />);
    expect(html).toContain("1,999.50");
    expect(html).not.toMatch(/KES|\$|USD/);
  });

  it("attaches the real currency once the page has one to pass down", () => {
    const html = renderToStaticMarkup(
      <ProductGrid storeSlug="genmars-store" products={[product({ price: "1999.50" })]} currency="KES" />
    );
    expect(html).toMatch(/KES/);
  });

  it("defaults to the unthemed grid layout when no themeConfig is given, same as before theming existed", () => {
    const html = renderToStaticMarkup(
      <ProductGrid storeSlug="genmars-store" products={[product({})]} />
    );
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("rounded-lg");
  });

  it("renders the fashion theme's editorial card layout — no border, larger heading", () => {
    const html = renderToStaticMarkup(
      <ProductGrid
        storeSlug="genmars-store"
        products={[product({ name: "Linen Shirt" })]}
        themeConfig={THEME_REGISTRY.fashion}
      />
    );
    expect(html).toContain("Linen Shirt");
    expect(html).toContain("font-serif");
    expect(html).toContain("aspect-[3/4]");
  });

  it("renders the electronics theme's compact card with the SKU visible", () => {
    const html = renderToStaticMarkup(
      <ProductGrid
        storeSlug="genmars-store"
        products={[product({ sku: "USB-C-CABLE-2M" })]}
        themeConfig={THEME_REGISTRY.electronics}
      />
    );
    expect(html).toContain("USB-C-CABLE-2M");
    expect(html).toContain("font-mono");
  });

  it("renders the grocery theme's quick-add button directly on the card", () => {
    const html = renderToStaticMarkup(
      <ProductGrid
        storeSlug="genmars-store"
        products={[product({ id: 42 })]}
        themeConfig={THEME_REGISTRY.grocery}
      />
    );
    // AddToCartForm's compact mode — a bare "+" button, no quantity stepper.
    expect(html).toContain('aria-label="Add to cart"');
    expect(html).toContain('name="productId" value="42"');
    expect(html).not.toContain('name="quantity" type="number"');
  });
});
