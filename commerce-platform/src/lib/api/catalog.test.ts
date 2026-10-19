import { afterEach, describe, expect, it, vi } from "vitest";

import { getProduct, listCategories, listProducts } from "./catalog";

/**
 * Asserts the exact URL each call builds, mocking `fetch` directly rather
 * than a higher-level wrapper — this is the one place that proves the
 * business slug actually lands in the request path, which is the entire
 * reason a URL-keyed cache can never mix up two businesses' catalogs (see
 * docs/API_CONTRACT.md's caching section and the final report).
 */
function mockFetchOnce(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.API_BASE_URL = "http://localhost:8010";
});

process.env.API_BASE_URL = "http://localhost:8010";

describe("listProducts", () => {
  it("requests the business-scoped products endpoint with no query string by default", async () => {
    const fetchMock = mockFetchOnce({ count: 0, next: null, previous: null, results: [] });
    await listProducts("genmars-store");
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toBe("http://localhost:8010/api/genmars-store/products/");
  });

  it("appends a category filter when given one, and nothing else", async () => {
    const fetchMock = mockFetchOnce({ count: 0, next: null, previous: null, results: [] });
    await listProducts("acme-fashion", { category: "7" });
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toBe("http://localhost:8010/api/acme-fashion/products/?category=7");
  });

  it("never sends page_size — the backend doesn't honor it (confirmed live)", async () => {
    const fetchMock = mockFetchOnce({ count: 0, next: null, previous: null, results: [] });
    await listProducts("genmars-store");
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.searchParams.has("page_size")).toBe(false);
  });
});

describe("getProduct", () => {
  it("requests the business-scoped product-detail endpoint by numeric id", async () => {
    const fetchMock = mockFetchOnce({ id: 42 });
    await getProduct("genmars-store", 42);
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toBe("http://localhost:8010/api/genmars-store/products/42/");
  });

  it("scopes to a different business when given a different slug for the same id", async () => {
    const fetchMock = mockFetchOnce({ id: 42 });
    await getProduct("acme-fashion", 42);
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toBe("http://localhost:8010/api/acme-fashion/products/42/");
  });
});

describe("listCategories", () => {
  it("requests the business-scoped categories endpoint", async () => {
    const fetchMock = mockFetchOnce({ count: 0, next: null, previous: null, results: [] });
    await listCategories("genmars-store");
    const requestedUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toBe("http://localhost:8010/api/genmars-store/categories/");
  });
});
