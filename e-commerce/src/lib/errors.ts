import type { ApiError } from "./types";

/**
 * Backend errors arrive as either `{"detail": "..."}` (core/exceptions.py's
 * safe_exception_handler, or anything the service layer raised) or DRF's
 * default `{"field": ["message", ...]}` validation shape. This picks a
 * single readable line out of either for a toast — per-field display in
 * forms should still read `body` directly for field-level messages.
 */
export function readableErrorMessage(body: unknown, fallback = "Something went wrong."): string {
  if (!body || typeof body !== "object") return fallback;
  const error = body as ApiError;

  if (typeof error.detail === "string") return error.detail;

  for (const value of Object.values(error)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return fallback;
}
