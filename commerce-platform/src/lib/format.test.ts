import { describe, expect, it } from "vitest";

import { displayNameFromSlug, formatMoney, formatPrice } from "./format";

describe("displayNameFromSlug", () => {
  it("title-cases each hyphen-separated word", () => {
    expect(displayNameFromSlug("genmars-store")).toBe("Genmars Store");
    expect(displayNameFromSlug("acme-fashion")).toBe("Acme Fashion");
  });

  it("handles a single-word slug", () => {
    expect(displayNameFromSlug("acme")).toBe("Acme");
  });
});

describe("formatPrice", () => {
  it("adds a thousands separator and fixes two decimal places", () => {
    expect(formatPrice("1999.5")).toBe("1,999.50");
    expect(formatPrice("1000000.00")).toBe("1,000,000.00");
  });

  it("never attaches a currency symbol or code — none is verified for every business", () => {
    expect(formatPrice("1500.00")).not.toMatch(/[A-Z]{3}|\$/);
  });
});

describe("formatMoney", () => {
  it("attaches the real currency once GET /api/<slug>/store/ provides one", () => {
    // Intl.NumberFormat may use a non-breaking space between an
    // alphabetic currency code and the amount — normalized here rather
    // than hardcoding that exact whitespace character.
    expect(formatMoney("1500.00", "KES").replace(/\s/g, " ")).toBe("KES 1,500.00");
    expect(formatMoney("1500.00", "USD")).toBe("$1,500.00");
  });

  it("falls back to digit-only formatting when no currency is given", () => {
    expect(formatMoney("1500.00")).toBe(formatPrice("1500.00"));
    expect(formatMoney("1500.00", null)).toBe(formatPrice("1500.00"));
  });

  it("falls back rather than throwing for a currency code Intl doesn't recognize", () => {
    expect(formatMoney("1500.00", "NOT-A-CODE")).toBe(formatPrice("1500.00"));
  });

  it("returns the raw price unchanged for a non-numeric value, same as formatPrice", () => {
    expect(formatMoney("not-a-number", "KES")).toBe("not-a-number");
  });
});
