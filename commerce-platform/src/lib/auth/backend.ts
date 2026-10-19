import "server-only";

import { apiFetch } from "../api/client";
import type { AuthResponse, User } from "../api/types";

/**
 * Thin wrappers around the verified endpoints documented in
 * docs/API_CONTRACT.md's "Phase 2 additions" section — every shape here
 * is read from the backend's actual source, not guessed.
 */

export function backendLogin(email: string, password: string) {
  return apiFetch<AuthResponse>("auth/login/", { method: "POST", body: { email, password } });
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

/**
 * Same response shape as login — `{user, access, refresh}`
 * (accounts/views.py::RegisterView._tokens_for()) — so the BFF route for
 * this can reuse login's own cookie-setting logic unchanged.
 */
export function backendRegister(input: RegisterInput) {
  return apiFetch<AuthResponse>("auth/register/", { method: "POST", body: input });
}

export interface RefreshResult {
  access: string;
  refresh: string;
}

/**
 * ROTATE_REFRESH_TOKENS=True on the backend means this ALWAYS returns a
 * new `refresh` alongside `access`, and blacklists the one that was sent.
 * A caller that doesn't persist the new `refresh` value breaks the
 * session on the very next refresh attempt, not just "misses an
 * optimization."
 */
export function backendRefresh(refreshToken: string) {
  return apiFetch<RefreshResult>("auth/refresh/", {
    method: "POST",
    body: { refresh: refreshToken },
  });
}

/**
 * Best-effort by design — the backend's own LogoutView already treats an
 * invalid/expired refresh token as "still a success" (204 either way).
 * Requires a valid access token (IsAuthenticated); if the access token
 * itself is already expired, this will throw and the caller is expected
 * to clear the local session regardless (see the logout route).
 */
export function backendLogout(accessToken: string, refreshToken?: string) {
  return apiFetch<void>("auth/logout/", {
    method: "POST",
    accessToken,
    body: refreshToken ? { refresh: refreshToken } : {},
  });
}

export function backendMe(accessToken: string) {
  return apiFetch<User>("me/", { accessToken });
}
