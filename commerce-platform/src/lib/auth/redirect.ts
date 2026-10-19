/**
 * Validates a post-login `?next=` target so it can never send a signed-in
 * user to an attacker-controlled external site (an open-redirect, the
 * classic abuse of a "redirect back to where you came from" param).
 *
 * Only a same-app relative path is accepted: must start with exactly one
 * `/` (so `//evil.com` — a protocol-relative URL most browsers will treat
 * as a redirect to `evil.com` — is rejected, since that starts with two),
 * and must not contain `://` anywhere (so `/x?u=https://evil.com` style
 * tricks and absolute URLs are both rejected). Anything that fails either
 * check falls back to the default, never to the rejected value.
 */
export function sanitizeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
