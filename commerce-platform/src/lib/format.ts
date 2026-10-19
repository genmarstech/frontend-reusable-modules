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
