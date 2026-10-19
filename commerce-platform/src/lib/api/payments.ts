import "server-only";

import { apiFetch } from "./client";
import type { Payment } from "./types";

/**
 * POST /api/<business_slug>/payments/mpesa/initiate/ — asks Safaricom to
 * prompt `phone` for the order's own total; the response is a `202` with the
 * created `Payment` row, which starts `pending` and is NEVER resolved by this
 * call. Whether money actually moved is decided later, server-to-server, by
 * Safaricom's own callback (payments/views.py::MpesaCallbackView) — nothing
 * this frontend does can move a `Payment` out of `pending` itself.
 *
 * `MPESA_ENABLED=False` on the backend by default means this fails with a
 * safe `{"detail": "M-Pesa is not configured on this server."}` until real
 * Daraja credentials are set — see e-commerce-backend's own CLAUDE.md and
 * payments/mpesa.py. No live push has ever been fired in this project;
 * this call only ever does whatever the backend's own configuration allows.
 */
export function initiateMpesaPayment(
  accessToken: string,
  businessSlug: string,
  input: { order_reference: string; phone: string }
) {
  return apiFetch<Payment>("payments/mpesa/initiate/", {
    businessSlug,
    accessToken,
    method: "POST",
    body: input,
  });
}
