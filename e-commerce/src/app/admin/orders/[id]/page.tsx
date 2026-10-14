import { notFound } from "next/navigation";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import type { Order } from "@/lib/types";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { OrderTimeline } from "@/components/storefront/OrderTimeline";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { Card, CardBody } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order: Order;
  try {
    order = await djangoFetch<Order>(`/api/ops/orders/${id}/`, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Order</p>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{order.reference}</h1>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <OrderStatusActions orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-text">Items</h2>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-text">{item.product_name}</p>
                      <p className="text-xs text-text-muted">
                        {item.sku} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-text">{formatMoney(item.line_total, order.currency)}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-text">Status history</h2>
              <OrderTimeline history={order.status_history} />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-text">Customer</h2>
              <p className="text-sm text-text">{order.contact_email}</p>
              <p className="text-sm text-text-muted">{order.contact_phone}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-text">Delivery to</h2>
              <p className="text-sm text-text">{order.delivery_recipient_name}</p>
              <p className="text-sm text-text-muted">
                {order.delivery_line1}
                {order.delivery_line2 ? `, ${order.delivery_line2}` : ""}, {order.delivery_city}
              </p>
              <p className="text-sm text-text-muted">{order.delivery_phone}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-3 text-sm font-semibold text-text">Summary</h2>
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Subtotal</dt>
                  <dd className="text-text">{formatMoney(order.subtotal, order.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Delivery</dt>
                  <dd className="text-text">{formatMoney(order.delivery_fee, order.currency)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                  <dt className="text-text">Total</dt>
                  <dd className="text-text">{formatMoney(order.total, order.currency)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
