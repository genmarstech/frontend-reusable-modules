import { describe, expect, it } from "vitest";

import { STORE_THEMES, isStoreTheme, resolveStoreTheme } from "./types";

describe("isStoreTheme", () => {
  it("accepts every value in STORE_THEMES", () => {
    for (const theme of STORE_THEMES) {
      expect(isStoreTheme(theme)).toBe(true);
    }
  });

  it("rejects a value this frontend doesn't recognize", () => {
    expect(isStoreTheme("holographic")).toBe(false);
    expect(isStoreTheme("")).toBe(false);
  });
});

describe("resolveStoreTheme", () => {
  it("passes through a recognized theme unchanged", () => {
    expect(resolveStoreTheme("fashion")).toBe("fashion");
  });

  it("falls back to default for undefined, null, or an unrecognized value", () => {
    // core/models.py::StoreSettings.Theme can grow ahead of this frontend
    // being redeployed — an unrecognized value must degrade gracefully,
    // not crash the storefront a customer is trying to buy from.
    expect(resolveStoreTheme(undefined)).toBe("default");
    expect(resolveStoreTheme(null)).toBe("default");
    expect(resolveStoreTheme("a-theme-added-to-the-backend-after-this-frontend-shipped")).toBe("default");
  });
});
