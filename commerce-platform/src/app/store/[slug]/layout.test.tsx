import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ApiError, NetworkError } from "@/lib/api/client";
import StoreLayout from "./layout";

vi.mock("@/lib/api/catalog", () => ({
  listCategories: vi.fn(),
}));
vi.mock("@/lib/api/store", () => ({
  getStoreInfo: vi.fn(),
}));
// getCurrentUser() reads cookies() via next/headers, which throws outside a
// real request scope (confirmed live — this is exactly why it's mocked
// rather than exercised for real here); StoreHeader only needs SOME value,
// signed-in or not, to render, so every test below gets `null` unless it's
// specifically testing the signed-in-vs-signed-out header difference.
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}));
// The real LogoutButton calls useRouter(), which throws outside a real
// Next.js app-router tree (no provider for renderToStaticMarkup to read
// from) — stubbed here the same way listCategories/getCurrentUser are,
// rather than teaching this test about Next's router internals.
vi.mock("@/components/auth/LogoutButton", () => ({
  LogoutButton: () => <button type="button">Sign out</button>,
}));

const { listCategories } = await import("@/lib/api/catalog");
const { getStoreInfo } = await import("@/lib/api/store");
const { getCurrentUser } = await import("@/lib/auth/session");
const mockedListCategories = listCategories as unknown as ReturnType<typeof vi.fn>;
const mockedGetStoreInfo = getStoreInfo as unknown as ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;

const defaultStoreInfo = { name: "Acme Fashion Co", currency: "KES", theme: "default" };

describe("StoreLayout", () => {
  it("calls Next's notFound() for an unknown or inactive slug — the API doesn't distinguish, and neither does this", async () => {
    mockedListCategories.mockRejectedValueOnce(new ApiError(404, { detail: "No such business." }));
    mockedGetStoreInfo.mockRejectedValueOnce(new ApiError(404, { detail: "No such business." }));

    await expect(
      StoreLayout({ params: Promise.resolve({ slug: "does-not-exist" }), children: <p>child</p> })
    ).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404") });
  });

  it("renders the business's real display name (not a slug guess) and the page content", async () => {
    mockedListCategories.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    mockedGetStoreInfo.mockResolvedValueOnce(defaultStoreInfo);

    const element = await StoreLayout({
      params: Promise.resolve({ slug: "acme-fashion" }),
      children: <p data-testid="child">product grid goes here</p>,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Acme Fashion Co");
    expect(html).toContain("product grid goes here");
  });

  it("does not swallow a network failure as if the business simply didn't exist", async () => {
    mockedListCategories.mockRejectedValueOnce(new NetworkError(new Error("ECONNREFUSED")));
    mockedGetStoreInfo.mockResolvedValueOnce(defaultStoreInfo);

    await expect(
      StoreLayout({ params: Promise.resolve({ slug: "genmars-store" }), children: <p>child</p> })
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it("shows a sign-in link when no session exists, and the signed-in user's own controls when one does", async () => {
    mockedListCategories.mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    mockedGetStoreInfo.mockResolvedValue(defaultStoreInfo);

    mockedGetCurrentUser.mockResolvedValueOnce(null);
    const signedOutHtml = renderToStaticMarkup(
      await StoreLayout({ params: Promise.resolve({ slug: "acme-fashion" }), children: <p>child</p> })
    );
    expect(signedOutHtml).toContain("Sign in");

    mockedGetCurrentUser.mockResolvedValueOnce({
      id: 1,
      email: "shopper@example.com",
      first_name: "",
      last_name: "",
      phone_number: "",
      date_joined: "2026-01-01T00:00:00Z",
    });
    const signedInHtml = renderToStaticMarkup(
      await StoreLayout({ params: Promise.resolve({ slug: "acme-fashion" }), children: <p>child</p> })
    );
    expect(signedInHtml).toContain("Sign out");
    expect(signedInHtml).not.toContain(">Sign in<");
  });

  it("falls back to default's layout for a theme value this frontend doesn't recognize yet, instead of crashing", async () => {
    mockedListCategories.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    mockedGetStoreInfo.mockResolvedValueOnce({ name: "Future Store", currency: "KES", theme: "holographic" });

    const html = renderToStaticMarkup(
      await StoreLayout({ params: Promise.resolve({ slug: "future-store" }), children: <p>child</p> })
    );
    expect(html).toContain("Future Store");
  });
});
