import "server-only";

import { apiBaseUrl } from "./config";
import type { ApiErrorBody } from "./types";

/**
 * A validation/business-logic error the backend returned — core/
 * exceptions.py and DRF's default handler never produce anything else for
 * a 4xx/5xx. `body` is the parsed JSON, so a caller can distinguish a
 * field-level validation error ({"email": ["..."]})  from a flat one
 * ({"detail": "..."}) without re-parsing anything.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(apiErrorMessage(body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * The request never reached a response at all — DNS, connection refused,
 * timeout. Distinct from ApiError on purpose: "the backend told us no" and
 * "we couldn't ask the backend" call for different messaging to a user and
 * different handling in a caller (retry makes sense for one, not the
 * other).
 */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Could not reach the server. Check your connection and try again.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

function apiErrorMessage(body: ApiErrorBody): string {
  if ("detail" in body && typeof body.detail === "string") {
    return body.detail;
  }
  const [firstField] = Object.keys(body);
  if (firstField) {
    const messages = (body as Record<string, string[]>)[firstField];
    if (Array.isArray(messages) && messages.length > 0) {
      return messages[0];
    }
  }
  return "The request could not be completed.";
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** A business's own endpoints live at /api/<slug>/..., /api/ops/<slug>/... */
  businessSlug?: string;
  /** A plain object is JSON-encoded. A `FormData` (a real file upload —
   * see catalog.ts::uploadProductImage) is sent as-is; see below for why. */
  body?: unknown;
  accessToken?: string;
}

/**
 * The one place a request actually goes out to the backend. `path` is
 * relative to the API root — callers never build a full URL themselves,
 * so the base URL and error handling stay in exactly one place.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { businessSlug, body, accessToken, headers, ...rest } = options;

  const url = new URL(
    businessSlug ? `/api/${businessSlug}/${path.replace(/^\/+/, "")}` : `/api/${path.replace(/^\/+/, "")}`,
    apiBaseUrl()
  );

  // A FormData body (a file upload) must never be JSON.stringify'd, and
  // must never get an explicit Content-Type set — fetch needs to generate
  // its own `multipart/form-data; boundary=...` from the FormData instance
  // itself; a forced `application/json` here would make the backend reject
  // the request before DRF's parser even looks at the body.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, parsed as ApiErrorBody);
  }

  return parsed as T;
}
