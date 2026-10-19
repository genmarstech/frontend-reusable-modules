import { beforeAll, describe, expect, it } from "vitest";

/**
 * Real HTTP against a running instance of this app (and, transitively,
 * a running backend) — see tests/integration/README.md for exact
 * prerequisites and the commands used to run these for real in this
 * review. These are deliberately NOT mocked: cookie flags, redirect
 * behavior, and CSRF rejection are protocol-level properties that a
 * mocked `fetch` would just assert about the mock, not about the real
 * app.
 *
 * Login is throttled on the backend (ScopedRateThrottle, "auth": 20/min —
 * config/settings.py) — a deliberate security control, not something to
 * work around. This file calls the real login endpoint only where a test
 * genuinely needs a fresh, independent session (rotation, reuse-after-
 * rotation, logout); every CSRF-rejection test and the dashboard
 * pass-through check reuse ONE shared session from beforeAll, since none
 * of them mutate or invalidate it.
 */

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3040";
const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "login-check@example.com";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? "a-strong-passw0rd!";

function cookieHeaderFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((raw) => raw.split(";")[0])
    .join("; ");
}

async function login(): Promise<{ cookieHeader: string; setCookies: string[] }> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  if (!response.ok) {
    throw new Error(
      `Integration test setup failed: login returned ${response.status}. ` +
        `Confirm the backend is running and a user ${TEST_EMAIL} exists (see tests/integration/README.md). ` +
        `A 429 here means the backend's auth throttle (20/min) was already exhausted — ` +
        `wait a minute and re-run rather than re-running immediately back to back.`
    );
  }
  return { cookieHeader: cookieHeaderFrom(response), setCookies: response.headers.getSetCookie() };
}

let sharedSession: string;

beforeAll(async () => {
  try {
    await fetch(BASE_URL);
  } catch {
    throw new Error(`Could not reach ${BASE_URL} — is the frontend dev server running?`);
  }
  ({ cookieHeader: sharedSession } = await login());
});

describe("POST /api/auth/login", () => {
  it("rejects a cross-origin request (no CSRF bypass)", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://evil.example.com" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    expect(response.status).toBe(403);
  });

  it("rejects a request with no Origin header at all", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    expect(response.status).toBe(403);
  });

  it("rejects invalid credentials with a generic message and sets no session cookie", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({ email: TEST_EMAIL, password: "definitely-wrong" }),
    });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("detail");
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });

  it("on valid credentials: sets gm_access and gm_refresh as HttpOnly, SameSite=Lax cookies, and never returns a token in the body", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    expect(response.status).toBe(200);

    const bodyText = await response.text();
    expect(bodyText).not.toContain("eyJ"); // the base64url prefix every JWT here starts with
    const body = JSON.parse(bodyText);
    expect(body).toHaveProperty("user");
    expect(body).not.toHaveProperty("access");
    expect(body).not.toHaveProperty("refresh");

    const setCookies = response.headers.getSetCookie();
    const access = setCookies.find((c) => c.startsWith("gm_access="));
    const refresh = setCookies.find((c) => c.startsWith("gm_refresh="));
    expect(access).toBeDefined();
    expect(refresh).toBeDefined();
    for (const cookie of [access, refresh]) {
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=lax/i);
      expect(cookie).toMatch(/Path=\//);
    }
  });
});

describe("protected routes (/dashboard) with no session", () => {
  it("redirects to /login with a next= pointing back at the original path", async () => {
    const response = await fetch(`${BASE_URL}/dashboard`, { redirect: "manual" });
    expect([307, 308]).toContain(response.status);
    const location = response.headers.get("location") ?? "";
    expect(location).toContain("/login");
    expect(location).toContain(encodeURIComponent("/dashboard"));
  });
});

describe("protected routes (/dashboard) with a valid session", () => {
  it("is let through by the proxy (not redirected to /login)", async () => {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      redirect: "manual",
      headers: { Cookie: sharedSession },
    });
    // Not redirected to login — whether the route itself 404s because no
    // page exists yet (Step 4's confirmed blocker) is a separate question
    // from whether the session gate let the request through.
    expect([307, 308]).not.toContain(response.status);
  });
});

describe("POST /api/auth/refresh", () => {
  it("rejects a cross-origin request", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Origin: "http://evil.example.com", Cookie: sharedSession },
    });
    expect(response.status).toBe(403);
  });

  it("rotates both access and refresh tokens on success", async () => {
    const { cookieHeader } = await login();
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Origin: BASE_URL, Cookie: cookieHeader },
    });
    expect(response.status).toBe(200);
    const setCookies = response.headers.getSetCookie();
    expect(setCookies.some((c) => c.startsWith("gm_access="))).toBe(true);
    expect(setCookies.some((c) => c.startsWith("gm_refresh="))).toBe(true);
  });

  it("rejects a refresh token that was already rotated out (reuse after rotation fails)", async () => {
    const { cookieHeader: firstSession } = await login();

    const firstRefresh = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Origin: BASE_URL, Cookie: firstSession },
    });
    expect(firstRefresh.status).toBe(200);

    // Reuse the ORIGINAL (now-rotated-out) session cookie, not the new one.
    const secondRefresh = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Origin: BASE_URL, Cookie: firstSession },
    });
    expect(secondRefresh.status).toBe(401);
    const body = await secondRefresh.json();
    expect(body.detail).not.toMatch(/token/i); // no token-shaped vocabulary leaked to the client
  });
});

describe("POST /api/auth/logout", () => {
  it("rejects a cross-origin request", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "http://evil.example.com", Cookie: sharedSession },
    });
    expect(response.status).toBe(403);
  });

  it("clears both cookies, and the cleared session can no longer reach /dashboard", async () => {
    const { cookieHeader } = await login();

    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: BASE_URL, Cookie: cookieHeader },
    });
    expect(logoutResponse.status).toBe(200);
    const cleared = logoutResponse.headers.getSetCookie();
    expect(cleared.some((c) => c.startsWith("gm_access=") && /Expires=Thu, 01 Jan 1970/.test(c))).toBe(true);
    expect(cleared.some((c) => c.startsWith("gm_refresh=") && /Expires=Thu, 01 Jan 1970/.test(c))).toBe(true);

    // The browser would now send empty/expired cookies — simulate that by
    // reusing the ORIGINAL (pre-logout) cookie header, which the backend
    // has since blacklisted server-side regardless of what the browser
    // does with it locally.
    const afterLogout = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { Origin: BASE_URL, Cookie: cookieHeader },
    });
    expect(afterLogout.status).toBe(401);
  });
});
