import "server-only";

/**
 * Decodes a JWT's payload claims WITHOUT verifying its signature — this
 * module never has the backend's signing key and never needs it. This is
 * only ever used to answer "does this look like it's already expired,
 * before we bother sending it anywhere" so middleware can decide whether
 * to refresh proactively. It is never the authority on whether a token is
 * actually valid — the backend rejecting (or accepting) the request is
 * always the real check, and every caller of this still has to handle a
 * 401 from the backend regardless of what this says.
 */
export function decodeJwtPayload(token: string): { exp?: number; user_id?: unknown } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    // atob(), not Buffer — this needs to work from middleware too, which
    // may run in the Edge runtime (no Node.js globals); atob is a
    // web-standard global available in both.
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True if the token is missing, malformed, or past its own `exp` claim —
 * with a small buffer so a request doesn't race the exact expiry instant. */
export function isExpiredOrInvalid(token: string | undefined, bufferSeconds = 10): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 >= payload.exp - bufferSeconds;
}
