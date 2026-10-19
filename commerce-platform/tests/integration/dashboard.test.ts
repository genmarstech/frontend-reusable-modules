import { describe, expect, it } from "vitest";

/**
 * Step 4 / Step 5: the one real authenticated business page, and the
 * cross-business isolation property specifically — two different users,
 * each a member of a DIFFERENT business, each getting only their own
 * business's data back. See tests/integration/README.md for the second
 * user/business this needs to exist on the backend.
 */

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3040";
const USER_A = { email: process.env.TEST_USER_EMAIL ?? "login-check@example.com", password: process.env.TEST_USER_PASSWORD ?? "a-strong-passw0rd!" };
const USER_B = { email: process.env.TEST_USER_2_EMAIL ?? "login-check-2@example.com", password: process.env.TEST_USER_2_PASSWORD ?? "a-strong-passw0rd!" };

async function login(user: { email: string; password: string }): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`Login failed for ${user.email}: ${response.status}. See tests/integration/README.md.`);
  }
  return response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

describe("GET /dashboard — authenticated business page", () => {
  it("shows user A's own business, with no business slug ever supplied by the client", async () => {
    const cookieHeader = await login(USER_A);
    const response = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: cookieHeader } });
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Genmars Store");
  });

  it("shows user B's own, DIFFERENT business — not user A's", async () => {
    const cookieHeader = await login(USER_B);
    const response = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: cookieHeader } });
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Acme Fashion");
    expect(html).not.toContain("Genmars Store");
  });
});
