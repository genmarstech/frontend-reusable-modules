import "server-only";
import type { ApiError } from "./types";
import { readSessionCookies } from "./auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8010";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    super(typeof body.detail === "string" ? body.detail : `Request failed with ${status}`);
  }

  /** True when the caller isn't signed in (or their session expired). */
  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Skip attaching the session cookie — for genuinely public reads. */
  anonymous?: boolean;
  /** Passed straight through to fetch's `next` option (revalidate/tags). */
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
}

/**
 * The ONLY place that calls Django directly. Server Components, Server
 * Actions and Route Handlers all go through this — the browser never does
 * (see the auth architecture note in the project plan). Reads the httpOnly
 * session cookie and attaches it as a Bearer token; never mutates cookies
 * itself, which is what keeps it safe to call from a Server Component
 * (those can't write cookies) as well as from Server Actions/Route Handlers.
 *
 * A 401 is surfaced as `ApiRequestError` rather than retried-after-refresh
 * here — token refresh is `middleware.ts`'s job (it runs before this ever
 * executes and keeps the access cookie fresh across navigations). A 401
 * that still gets here means the refresh token itself is gone/invalid;
 * callers on protected pages should treat `isUnauthorized` as "redirect to
 * login".
 */
export async function djangoFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  if (!options.anonymous) {
    const { access } = await readSessionCookies();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const response = await fetch(`${DJANGO_API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiRequestError(response.status, data as ApiError);
  }
  return data as T;
}

/** Builds a query string from a plain object, dropping empty/undefined values. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
