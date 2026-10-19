/**
 * `GET /api/<slug>/store/` (src/lib/api/store.ts) is the real source for a
 * business's display name now — see docs/API_CONTRACT.md's "No public
 * business-detail endpoint" section. This slug-derived guess survives only
 * as the fallback for a request that can't reach that endpoint (a network
 * error, not a 404 — an unknown/suspended slug already 404s before this
 * would ever run). "acme-fashion" becomes "Acme Fashion" — a formatting
 * transform of real data the caller already validated, never a fabricated
 * value standing in for one the API could have given directly.
 */
export function displayNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Digits only, no currency unit — kept as the fallback `formatMoney()`
 * below uses when it has no currency code to work with (or an
 * unrecognized one), and for any call site that genuinely never has
 * access to GET /api/<slug>/store/'s `currency` field.
 */
export function formatPrice(price: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) {
    return price;
  }
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Currency-aware formatting, now that GET /api/<slug>/store/ makes a
 * business's real currency code available (see docs/API_CONTRACT.md) —
 * this platform is explicitly multi-currency-capable, so the digit-only
 * `formatPrice` above was never the final answer, only what was honest
 * without a currency to attach.
 *
 * Falls back to `formatPrice` — never throws — for a missing currency, or
 * one `Intl.NumberFormat` doesn't recognize (a typo'd code reaching here
 * from a business's own settings shouldn't take the whole storefront down
 * over a price label).
 */
export function formatMoney(price: string, currency?: string | null): string {
  if (!currency) return formatPrice(price);
  const amount = Number(price);
  if (!Number.isFinite(amount)) return price;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return formatPrice(price);
  }
}

/**
 * Splits a price into the whole-amount portion and its fraction digits (if
 * the currency has any — JPY doesn't), for PriceDisplay's large-price
 * treatment: big digits, small raised cents, the pattern most storefronts
 * (Amazon's included) use on a product page. Built on
 * `Intl.NumberFormat.formatToParts()` rather than string-splitting
 * `formatMoney`'s own output, because not every currency puts two digits
 * after a `.` in a fixed spot — guessing from the formatted string would
 * silently misplace the split for one this platform's multi-currency
 * businesses actually use. Falls back to `formatMoney`'s own fallback
 * chain (no currency, an unrecognized one, a non-numeric price) with no
 * fraction, same as formatMoney already does for all three.
 */
export interface MoneyParts {
  whole: string;
  fraction: string | null;
}

export function formatMoneyParts(price: string, currency?: string | null): MoneyParts {
  const amount = Number(price);
  if (!currency || !Number.isFinite(amount)) {
    return { whole: formatMoney(price, currency), fraction: null };
  }
  try {
    const parts = new Intl.NumberFormat("en-US", { style: "currency", currency }).formatToParts(amount);
    const fraction = parts.find((part) => part.type === "fraction")?.value ?? null;
    const whole = parts
      .filter((part) => part.type !== "fraction" && part.type !== "decimal")
      .map((part) => part.value)
      .join("");
    return { whole, fraction };
  } catch {
    return { whole: formatMoney(price, currency), fraction: null };
  }
}
