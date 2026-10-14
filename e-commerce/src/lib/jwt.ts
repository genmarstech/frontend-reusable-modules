// Reads a JWT's claims WITHOUT verifying the signature. That's fine here —
// this token only ever came from our own Django backend over a direct
// server-to-server call and is stored in an httpOnly cookie the browser
// can't touch; we're reading `exp`/`user_id` to decide whether to refresh,
// not using this as an authorization decision. Django re-validates the
// signature on every request regardless.

export interface AccessTokenClaims {
  exp: number; // seconds since epoch
  user_id: string;
  token_type: "access";
}

export function decodeJwt<T>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** True if the token is missing, unparseable, or expires within `skewSeconds`. */
export function isExpiredOrExpiringSoon(token: string | undefined, skewSeconds = 60): boolean {
  if (!token) return true;
  const claims = decodeJwt<AccessTokenClaims>(token);
  if (!claims) return true;
  const nowSeconds = Date.now() / 1000;
  return claims.exp - nowSeconds < skewSeconds;
}
