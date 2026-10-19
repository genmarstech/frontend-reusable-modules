import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, NetworkError } from "@/lib/api/client";
import type { Category, Paginated, Product } from "@/lib/api/types";
import ProductDetailPage from "./page";

vi.mock("@/lib/api/catalog", () => ({
  getProduct: vi.fn(),
  listCategories: vi.fn(),
}));
vi.mock("@/lib/api/store", () => ({
  getStoreInfo: vi.fn(),
}));

const { getProduct, listCategories } = await import("@/lib/api/catalog");
const { getStoreInfo } = await import("@/lib/api/store");
const mockedGetProduct = getProduct as unknown as ReturnType<typeof vi.fn>;
const mockedListCategories = listCategories as unknown as ReturnType<typeof vi.fn>;
const mockedGetStoreInfo = getStoreInfo as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockedGetStoreInfo.mockReset().mockResolvedValue({ name: "Genmars Store", currency: "KES", theme: "default" });
});

function paginated<T>(results: T[]): Paginated<T> {
  return { count: results.length, next: null, previous: null, results };
}

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

describe("ProductDetailPage", () => {
  it("renders the product's own name, price and description", async () => {
    mockedGetProduct.mockResolvedValueOnce(product({}));

    const element = await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Men&#x27;s Classic Fit Shirt");
    expect(html).toContain("1,500");
    expect(html).toMatch(/<sup[^>]*>00<\/sup>/);
    expect(html).toContain("A shirt.");
  });

  it("resolves the category id to a name via the separate categories call", async () => {
    mockedGetProduct.mockResolvedValueOnce(product({ category: 7 }));
    mockedListCategories.mockResolvedValueOnce(
      paginated<Category>([{ id: 7, name: "Apparel", slug: "apparel", parent: null }])
    );

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) })
    );

    expect(html).toContain("Apparel");
  });

  it("renders a variant picker, not a bare price, when the product has variants", async () => {
    mockedGetProduct.mockResolvedValueOnce(
      product({
        variants: [
          { id: 1, product: 1, name: "Size", value: "M", sku: "SKU-1-M", price_override: null, price: "1500.00" },
          { id: 2, product: 1, name: "Size", value: "L", sku: "SKU-1-L", price_override: "1600.00", price: "1500.00" },
        ],
      })
    );

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) })
    );

    expect(html).toContain(">M<");
    expect(html).toContain(">L<");
  });

  it("calls notFound() for a product id the resolved business doesn't own", async () => {
    mockedGetProduct.mockRejectedValueOnce(new ApiError(404, { detail: "Not found." }));

    await expect(
      ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "999" }) })
    ).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404") });
  });

  it("renders a visible error instead of crashing on a non-404 API failure", async () => {
    mockedGetProduct.mockRejectedValueOnce(new ApiError(500, { detail: "Internal server error" }));

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) })
    );

    expect(html).toContain("Backend returned 500");
  });

  it("renders a network-failure message distinct from an API error", async () => {
    mockedGetProduct.mockRejectedValueOnce(new NetworkError(new Error("ECONNREFUSED")));

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) })
    );

    expect(html).toContain("Could not reach the store");
  });

  it("formats the price with the business's real currency once one is known", async () => {
    mockedGetProduct.mockResolvedValueOnce(product({ price: "2500.00" }));
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Genmars Store", currency: "USD", theme: "default" });

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "genmars-store", id: "1" }) })
    );

    expect(html).toContain("$2,500");
    expect(html).toMatch(/<sup[^>]*>00<\/sup>/);
  });

  it("applies the fashion theme's heading font and taller image aspect ratio", async () => {
    mockedGetProduct.mockResolvedValueOnce(product({}));
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Acme Fashion", currency: "KES", theme: "fashion" });

    const html = renderToStaticMarkup(
      await ProductDetailPage({ params: Promise.resolve({ slug: "acme-fashion", id: "1" }) })
    );

    expect(html).toContain("font-serif");
    expect(html).toContain("aspect-[3/4]");
  });
});
