import { notFound, redirect } from "next/navigation";

import { getOrder } from "@/lib/api/orders";
import { ApiError, NetworkError } from "@/lib/api/client";
import { mpesaEnabled } from "@/lib/api/config";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { ErrorState } from "@/components/ui/States";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";
import { CancelOrderButton } from "./CancelOrderButton";
import { MpesaPaymentForm } from "./MpesaPaymentForm";

// Mirrors orders/views.py::CUSTOMER_CANCELLABLE and
// payments/views.py::ORDER_PAYABLE_STATUSES exactly — both happen to be the
// same two statuses today, kept as two named sets rather than one shared
// one so a future divergence between "cancellable" and "payable" doesn't
// require first noticing they'd quietly been assumed identical here.
const CUSTOMER_CANCELLABLE = new Set(["awaiting_payment", "payment_failed"]);
const ORDER_PAYABLE_STATUSES = new Set(["awaiting_payment", "payment_failed"]);

/** `instant = false` — same per-request, authorization-gated reasoning as
 * every other protected storefront page in this module. */
export const instant = false;
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const returnPath = `/store/${slug}/orders/${id}`;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  let order: Awaited<ReturnType<typeof getOrder>>;
  try {
    order = await getOrder(accessToken, slug, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(returnPath)}&reason=session_expired`);
    }
    if (error instanceof ApiError && error.status === 404) {
      // Someone else's order, an order placed with a different business, or
      // an id that never existed — all identical 404s on the backend
      // (orders/views.py's own comment), so this never tries to tell them
      // apart either.
      notFound();
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the store" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{order.reference}</h1>
          <p className="text-xs text-neutral-500">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
        <ul className="mt-2 divide-y divide-neutral-200 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-neutral-200 pt-3 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {Number(order.delivery_fee) > 0 && <Row label="Delivery" value={formatPrice(order.delivery_fee)} />}
          {Number(order.discount_total) > 0 && (
            <Row label="Discount" value={`−${formatPrice(order.discount_total)}`} />
          )}
          {Number(order.tax_total) > 0 && <Row label="Tax" value={formatPrice(order.tax_total)} />}
          <Row label="Total" value={`${order.currency} ${formatPrice(order.total)}`} strong />
        </dl>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Delivering to</h2>
        <p className="mt-2 text-neutral-700">
          {order.delivery_recipient_name}
          <br />
          {order.delivery_line1}
          {order.delivery_line2 && <>, {order.delivery_line2}</>}
          <br />
          {order.delivery_city}
          <br />
          {order.delivery_phone}
        </p>
      </div>

      {order.status_history.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Status history</h2>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            {order.status_history.map((entry) => (
              <li key={entry.id} className="flex justify-between">
                <span className="capitalize">{entry.to_status.replace(/_/g, " ")}</span>
                <span className="text-xs text-neutral-400">{new Date(entry.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ORDER_PAYABLE_STATUSES.has(order.status) && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          {mpesaEnabled() ? (
            <>
              <h2 className="text-sm font-semibold text-neutral-900">Pay with M-Pesa</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Sends an STK prompt to the number below — enter the phone you want to pay from, which doesn&apos;t
                have to match the delivery phone.
              </p>
              <div className="mt-3">
                <MpesaPaymentForm storeSlug={slug} orderId={order.id} orderReference={order.reference} />
              </div>
            </>
          ) : (
            // M-Pesa is off for this pilot — showing the STK form anyway
            // would send the customer into a guaranteed "M-Pesa is not
            // configured on this server" failure. Say the true thing
            // instead: payment is arranged manually, order status already
            // reflects reality (never silently marked paid — only
            // payments/views.py::MpesaCallbackView can do that).
            <>
              <h2 className="text-sm font-semibold text-neutral-900">Payment</h2>
              <p className="mt-1 text-sm text-neutral-700">
                This order is awaiting payment. We&apos;ll contact you on the phone number you provided to arrange
                payment — no automatic M-Pesa prompt will be sent for this order.
              </p>
            </>
          )}
        </div>
      )}

      {CUSTOMER_CANCELLABLE.has(order.status) && <CancelOrderButton storeSlug={slug} orderId={order.id} />}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold text-neutral-900" : "text-neutral-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
