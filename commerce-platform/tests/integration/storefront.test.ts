import { beforeAll, describe, expect, it } from "vitest";

/**
 * Step 5: real HTTP against a running instance of this app (which itself
 * calls a running backend) — unlike the mocked component tests in src/,
 * this is the one place that actually proves the business slug baked
 * into every request path keeps two tenants' catalogs apart end to end,
 * not just that the code calls the right mock. See
 * tests/integration/README.md for exactly which backend fixtures this
 * needs — the same genmars-store / acme-fashion pair dashboard.test.ts
 * already requires, both carrying a product named "Men's Classic Fit
 * Shirt" under different ids.
 *
 * Those ids are looked up here, from the backend directly, rather than
 * hardcoded — they're ordinary autoincrement primary keys, so their exact
 * values depend on how many rows existed before this fixture was seeded.
 * Hardcoding them would make this suite pass only on the one database it
 * happened to be written against.
 */

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3040";
const BACKEND_URL = process.env.TEST_BACKEND_URL ?? "http://localhost:8010";

let genmarsShirtId: number;
let acmeShirtId: number;

async function findProductId(businessSlug: string, search: string): Promise<number> {
  const response = await fetch(`${BACKEND_URL}/api/${businessSlug}/products/?search=${encodeURIComponent(search)}`);
  if (!response.ok) {
    throw new Error(
      `Integration test setup failed: GET /api/${businessSlug}/products/?search=${search} returned ${response.status}. ` +
        `Confirm the backend is running at ${BACKEND_URL} and seeded per tests/integration/README.md.`
    );
  }
  const body = (await response.json()) as { results: { id: number }[] };
  if (body.results.length === 0) {
    throw new Error(
      `Integration test setup failed: ${businessSlug} has no product matching "${search}". See tests/integration/README.md.`
    );
  }
  return body.results[0].id;
}

beforeAll(async () => {
  [genmarsShirtId, acmeShirtId] = await Promise.all([
    findProductId("genmars-store", "Men's Classic Fit Shirt"),
    findProductId("acme-fashion", "Men's Classic Fit Shirt"),
  ]);
});

describe("GET /store/[slug] — public catalog", () => {
  it("renders a real business's own products", async () => {
    const response = await fetch(`${BASE_URL}/store/genmars-store`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Genmars Store");
  });

  it("renders a 'store not found' page for an unknown slug, with no API detail leaked", async () => {
    const response = await fetch(`${BASE_URL}/store/no-such-business-at-all`);
    expect(response.status).toBe(404);
    const html = await response.text();
    expect(html).toContain("Store not found");
  });

  it("two businesses with a same-named product each show only their own, under their own ids", async () => {
    const genmarsHtml = await (await fetch(`${BASE_URL}/store/genmars-store`)).text();
    const acmeHtml = await (await fetch(`${BASE_URL}/store/acme-fashion`)).text();

    expect(genmarsHtml).toContain("Men&#x27;s Classic Fit Shirt");
    expect(acmeHtml).toContain("Men&#x27;s Classic Fit Shirt");

    // Same product NAME, but the href must point at each business's own
    // route and its own numeric id — if these ever collided, a link
    // meant for one tenant's product would silently open the other's.
    expect(genmarsHtml).toContain(`/store/genmars-store/products/${genmarsShirtId}`);
    expect(acmeHtml).toContain(`/store/acme-fashion/products/${acmeShirtId}`);
    expect(genmarsHtml).not.toContain("/store/acme-fashion/");
    expect(acmeHtml).not.toContain("/store/genmars-store/");
  });
});

describe("GET /store/[slug]/products/[id] — public product detail", () => {
  it("serves a business's own product by id", async () => {
    const response = await fetch(`${BASE_URL}/store/acme-fashion/products/${acmeShirtId}`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Men&#x27;s Classic Fit Shirt");
  });

  it("shows the not-found page — not the other business's product — when fetched under a DIFFERENT business's slug", async () => {
    // acmeShirtId is acme-fashion's own "Men's Classic Fit Shirt" —
    // requesting it through genmars-store's slug must not resolve just
    // because the id exists somewhere on the platform.
    //
    // Asserts rendered content, not HTTP status: unlike /store/[slug]
    // (gated by src/proxy.ts before anything streams, so that one really
    // does 404), this route's data dependency is the product id itself,
    // which proxy.ts deliberately does NOT fetch — doing so would mean
    // fetching the same product twice per request (once to decide
    // routing, again to render it), for a narrower case than an entire
    // nonexistent store. Confirmed live: this response's HTTP status is
    // 200 (Cache Components mode locks the status once its Suspense
    // fallback streams, before notFound() resolves — see not-found.md's
    // "Calling notFound() before streaming starts returns a 404" and
    // src/app/store/unavailable/page.tsx for the one place this project
    // does pay for a real 404). The rendered page is still the correct
    // one — a crawler sees a "soft 404" (Next adds its own noindex meta
    // tag), a real visitor sees the right message, and nothing here ever
    // shows one business's data under another's slug.
    const response = await fetch(`${BASE_URL}/store/genmars-store/products/${acmeShirtId}`);
    const html = await response.text();
    expect(html).toContain("Store not found");
    expect(html).not.toContain("Men&#x27;s Classic Fit Shirt");
  });

  it("shows the not-found page for an id that doesn't exist for either business", async () => {
    const response = await fetch(`${BASE_URL}/store/genmars-store/products/999999999`);
    const html = await response.text();
    expect(html).toContain("Store not found");
  });
});
