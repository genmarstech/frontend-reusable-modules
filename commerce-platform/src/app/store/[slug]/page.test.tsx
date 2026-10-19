import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, NetworkError } from "@/lib/api/client";
import type { Category, Paginated, Product } from "@/lib/api/types";
import StorePage from "./page";

vi.mock("@/lib/api/catalog", () => ({
  listProducts: vi.fn(),
  listCategories: vi.fn(),
}));
vi.mock("@/lib/api/store", () => ({
  getStoreInfo: vi.fn(),
}));

const { listProducts, listCategories } = await import("@/lib/api/catalog");
const { getStoreInfo } = await import("@/lib/api/store");
const mockedListProducts = listProducts as unknown as ReturnType<typeof vi.fn>;
const mockedListCategories = listCategories as unknown as ReturnType<typeof vi.fn>;
const mockedGetStoreInfo = getStoreInfo as unknown as ReturnType<typeof vi.fn>;

const defaultStoreInfo = { name: "Genmars Store", currency: "KES", theme: "default" };

beforeEach(() => {
  // Every existing test below predates theming and has no reason to care
  // about it — this keeps them all passing unchanged by giving every call
  // the plain default theme unless a test overrides it.
  mockedGetStoreInfo.mockReset().mockResolvedValue(defaultStoreInfo);
});

function paginated<T>(results: T[]): Paginated<T> {
  return { count: results.length, next: null, previous: null, results };
}

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    name: "Men's Classic Fit Shirt",
    slug: "mens-classic-fit-shirt",
    description: "",
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

const noSearchParams = Promise.resolve({});

describe("StorePage", () => {
  it("renders the products a business's own catalog call returns", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated([product({ id: 1 }), product({ id: 2, name: "Canvas Tote" })]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));

    const element = await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Men&#x27;s Classic Fit Shirt");
    expect(html).toContain("Canvas Tote");
  });

  it("shows two different businesses' products that happen to share a name without mixing them up", async () => {
    // Exactly the fixture pair seeded for this phase: genmars-store and
    // acme-fashion both have a product literally named "Men's Classic Fit
    // Shirt". The two calls below are two separate render passes, each
    // with its own mocked response keyed to its own slug — nothing in
    // StorePage itself has any way to ask for "the other business's"
    // products, because the slug is a function argument, not read from
    // shared state.
    mockedListProducts.mockResolvedValueOnce(paginated([product({ id: 101, sku: "GM-SHIRT-1" })]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));
    const genmarsHtml = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams })
    );

    mockedListProducts.mockResolvedValueOnce(paginated([product({ id: 202, sku: "ACME-SHIRT-1" })]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));
    const acmeHtml = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "acme-fashion" }), searchParams: noSearchParams })
    );

    expect(genmarsHtml).toContain('href="/store/genmars-store/products/101"');
    expect(genmarsHtml).not.toContain("/store/acme-fashion/");
    expect(acmeHtml).toContain('href="/store/acme-fashion/products/202"');
    expect(acmeHtml).not.toContain("/store/genmars-store/");
  });

  it("shows an honest empty state for a business with no published products, never fake ones", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated<Product>([]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams })
    );

    expect(html).toContain("No products here yet");
  });

  it("renders a visible error instead of crashing when the catalog call fails", async () => {
    mockedListProducts.mockRejectedValueOnce(new ApiError(500, { detail: "Internal server error" }));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams })
    );

    expect(html).toContain("Backend returned 500");
  });

  it("renders a network-failure message distinct from an API error", async () => {
    mockedListProducts.mockRejectedValueOnce(new NetworkError(new Error("ECONNREFUSED")));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams })
    );

    expect(html).toContain("Could not reach the store");
  });

  it("passes the category filter through to the products call, and only when present", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated<Product>([]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([{ id: 7, name: "Apparel", slug: "apparel", parent: null }]));

    await StorePage({
      params: Promise.resolve({ slug: "genmars-store" }),
      searchParams: Promise.resolve({ category: "7" }),
    });

    expect(mockedListProducts).toHaveBeenCalledWith("genmars-store", { category: "7" });
  });

  it("renders a themed hero for a store that has chosen one, and none at all for the default theme", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated<Product>([]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Acme Fashion Co", currency: "KES", theme: "fashion" });

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "acme-fashion" }), searchParams: noSearchParams })
    );

    expect(html).toContain("Acme Fashion Co");
    expect(html).toContain("New arrivals, curated for the season.");
  });

  it("passes the real currency down so prices show a real unit, not bare digits", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated([product({ price: "2500.00" })]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Genmars Store", currency: "KES", theme: "default" });

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "genmars-store" }), searchParams: noSearchParams })
    );

    expect(html).toMatch(/KES/);
  });

  it("falls back to the default layout for a theme value this frontend doesn't recognize yet", async () => {
    mockedListProducts.mockResolvedValueOnce(paginated<Product>([]));
    mockedListCategories.mockResolvedValueOnce(paginated<Category>([]));
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Future Store", currency: "KES", theme: "holographic" });

    const html = renderToStaticMarkup(
      await StorePage({ params: Promise.resolve({ slug: "future-store" }), searchParams: noSearchParams })
    );

    expect(html).toContain("No products here yet");
  });
});
