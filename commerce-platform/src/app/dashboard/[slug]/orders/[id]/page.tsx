import { notFound } from "next/navigation";

import { ApiError, NetworkError } from "@/lib/api/client";
import { getOpsOrder } from "@/lib/api/ops/orders";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { ErrorState } from "@/components/ui/States";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";
import { TransitionOrderForm } from "./TransitionOrderForm";
import type { Order, OrderStatus } from "@/lib/api/types";

// Mirrors orders/services.py::ALLOWED_TRANSITIONS exactly — the backend is
// the real authority (it re-checks on every POST); this only decides which
// options the dropdown offers, so staff aren't shown a move that would
// just come back as a 400.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: ["paid", "payment_failed", "cancelled"],
  payment_failed: ["awaiting_payment", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export const instant = false;
export default async function OpsOrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const accessToken = (await getAccessToken())!;

  let order: Order;
  try {
    order = await getOpsOrder(accessToken, slug, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{order.reference}</h2>
          <p className="text-xs text-neutral-500">
            {order.contact_email} · Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Items</h3>
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
        <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm font-semibold">
          <span>Total</span>
          <span>
            {order.currency} {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Delivering to</h3>
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
          <h3 className="text-sm font-semibold text-neutral-900">Status history</h3>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            {order.status_history.map((entry) => (
              <li key={entry.id} className="flex justify-between">
                <span className="capitalize">
                  {entry.to_status.replace(/_/g, " ")}
                  {entry.note && <span className="text-neutral-400"> — {entry.note}</span>}
                </span>
                <span className="text-xs text-neutral-400">{new Date(entry.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Update status</h3>
        <div className="mt-2">
          <TransitionOrderForm storeSlug={slug} orderId={order.id} options={ALLOWED_TRANSITIONS[order.status]} />
        </div>
        {ALLOWED_TRANSITIONS[order.status].length === 0 && (
          <p className="text-xs text-neutral-400">This order is in a terminal state.</p>
        )}
      </div>
    </div>
  );
}
