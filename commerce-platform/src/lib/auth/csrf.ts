import "server-only";

import type { NextRequest } from "next/server";

/**
 * CSRF protection for the cookie-authenticated BFF boundary — explicitly
 * NOT inherited from the backend. Django's own CSRF middleware protects
 * Django's own cookie-authenticated views; the backend's actual auth
 * mechanism is a bearer token, which Django's CSRF checks don't apply to
 * and never did. The cookies THIS module sets are the only
 * cookie-authenticated surface that exists here, and they need their own
 * protection, independent of anything the backend does.
 *
 * Origin-header validation, checked on every state-changing BFF route
 * (login, logout, refresh — anything that isn't a plain GET): a
 * same-origin `fetch()` from this app's own pages always carries an
 * `Origin` header matching this app's own origin; a cross-site form or
 * script cannot forge that header to match (the browser sets it, not the
 * page's JS). Combined with the cookies' own `SameSite=Lax` (cookies.ts),
 * this is two independent layers, not one control relied on twice.
 *
 * A missing Origin header is treated as a failure, not a pass — a
 * legitimate same-origin fetch POST from this app's own client code
 * always sends one.
 *
 * ── WHY THIS USES THE Host HEADER, NOT request.nextUrl ──────────────────────
 * `request.nextUrl` looked like the obvious thing to compare against, and it
 * is wrong for two independent reasons, not one:
 *
 *   1. This container runs the `output: "standalone"` server (`node
 *      server.js`), which builds `request.nextUrl` from its OWN listen
 *      address — the `HOSTNAME`/`PORT` env vars (`0.0.0.0:3040`) — not from
 *      the incoming `Host` header. Confirmed live: `request.nextUrl.host`
 *      came back `"0.0.0.0:3040"` even with a real `Host: commerce.genmars
 *      .co.ke` header on the request. No proxy header fixes this, because
 *      the bug isn't about scheme detection — nextUrl's hostname is simply
 *      never derived from the request at all in this runtime mode.
 *   2. Separately, deployed behind Caddy (see the backend repo's
 *      docs/HETZNER_DEPLOYMENT.md), this container never sees TLS directly
 *      — Caddy terminates it and proxies over plain HTTP on the compose
 *      network, loopback-bound (`127.0.0.1:...` in compose.hetzner.yaml,
 *      never a wildcard).
 *
 * Both were confirmed live, together: a real browser's
 * `https://commerce.genmars.co.ke` POST was rejected as cross-origin, which
 * blocked every real sign-in once this went public.
 *
 * The fix doesn't patch either symptom of `nextUrl` — it stops reading
 * `nextUrl` for this at all. `request.headers.get("host")` is the thing
 * Caddy actually forwards from the real request, unlike nextUrl in this
 * runtime mode, and `x-forwarded-proto` is the one header a TLS-terminating
 * proxy sets that a direct connection never does. Trusting the latter is
 * safe specifically because the container is reachable only through Caddy
 * (the loopback bind above) — nothing else can reach this process to forge
 * it. A direct, unproxied request (local dev) simply never carries the
 * header, so it falls back to this request's own actual protocol.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;

  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return origin === `${protocol}://${host}`;
}
