/**
 * Server-only. Nothing in this module is a secret — `API_BASE_URL` is just
 * the backend's origin, the same thing a browser making the request would
 * need to know anyway — but nothing in this phase has a client-side caller
 * that needs it either, so it stays off the `NEXT_PUBLIC_*` allowlist
 * until something genuinely needs to call the backend from the browser.
 * See docs/API_CONTRACT.md's "Unresolved integration questions" for the
 * actual open decision this defers (BFF proxy vs. direct browser calls).
 *
 * Read lazily (inside functions, not at module-eval time) so a missing
 * env var fails the one request that needed it, not the build or every
 * route regardless of whether it touches the API.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

export function apiBaseUrl(): string {
  return required("API_BASE_URL").replace(/\/+$/, "");
}

/**
 * Whether to offer M-Pesa at all on the order page. `MPESA_ENABLED` on the
 * Django backend is a single, global setting (not per-business data), so
 * this mirrors it as a separate env var on this deployment rather than
 * adding a new backend endpoint just to expose one boolean — the two must
 * be kept in sync by whoever deploys each side, same as `API_BASE_URL`/
 * `CORS_ALLOWED_ORIGINS` already have to be. Defaults to disabled: a
 * missing or unset var means customers see the honest "we'll contact you"
 * message rather than a form calling an M-Pesa integration that might not
 * be configured on the backend it's pointed at.
 */
export function mpesaEnabled(): boolean {
  return (process.env.MPESA_ENABLED ?? "").trim().toLowerCase() === "true";
}
