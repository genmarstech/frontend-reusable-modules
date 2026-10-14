import "server-only";
import type { ApiError, User } from "./types";

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8010";

export class AuthServiceError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(body.detail ?? "Authentication failed.");
  }
}

interface TokenPair {
  access: string;
  refresh: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${DJANGO_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AuthServiceError(response.status, data as ApiError);
  }
  return data as T;
}

export function login(email: string, password: string) {
  return post<TokenPair & { user: User }>("/api/auth/login/", { email, password });
}

export function register(input: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}) {
  return post<TokenPair & { user: User }>("/api/auth/register/", input);
}

export function refreshAccessToken(refresh: string) {
  return post<{ access: string; refresh?: string }>("/api/auth/refresh/", { refresh });
}

export async function logout(refresh: string) {
  await fetch(`${DJANGO_API_URL}/api/auth/logout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  }).catch(() => {
    // Best effort — if Django is unreachable the local cookies still get
    // cleared by the route handler that calls this, which is what actually
    // signs the browser out.
  });
}

export function requestPasswordReset(email: string) {
  return post<{ detail: string }>("/api/auth/password-reset/", { email });
}

export function confirmPasswordReset(email: string, code: string, new_password: string) {
  return post<{ detail: string }>("/api/auth/password-reset/confirm/", { email, code, new_password });
}
