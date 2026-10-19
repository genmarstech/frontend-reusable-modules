import "server-only";

import { apiFetch } from "../client";
import type { Paginated, Payment } from "../types";

/** GET /api/ops/<slug>/payments/ — read-only; a Payment row is only ever
 * written by the M-Pesa callback (payments/views.py::MpesaCallbackView). */
export function listOpsPayments(
  accessToken: string,
  businessSlug: string,
  params: { status?: string; search?: string } = {}
) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<Paginated<Payment>>(`ops/${businessSlug}/payments/${qs ? `?${qs}` : ""}`, { accessToken });
}
