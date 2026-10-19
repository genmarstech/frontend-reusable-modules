import Link from "next/link";

import { ApiError, NetworkError } from "@/lib/api/client";
import { listOpsOrders } from "@/lib/api/ops/orders";
import { getAccessToken } from "@/lib/auth/session";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";
import type { OrderStatus, Paginated } from "@/lib/api/types";
import type { OrderSummary } from "@/lib/api/types";

const STATUSES: OrderStatus[] = [
  "awaiting_payment", "payment_failed", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];

export const instant = false;
export default async function OpsOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { status, q } = await searchParams;
  const accessToken = (await getAccessToken())!;

  let orders: Paginated<OrderSummary>;
  try {
    orders = await listOpsOrders(accessToken, slug, { status, search: q });
  } catch (error) {
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Orders</h2>

      <form className="flex flex-wrap gap-2 text-sm" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search reference, email, phone…"
          className="rounded-md border border-neutral-300 px-3 py-1.5"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-md border border-neutral-300 px-3 py-1.5">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white">
          Filter
        </button>
      </form>

      {orders.results.length === 0 ? (
        <EmptyState title="No orders match" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.results.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/${slug}/orders/${order.id}`} className="font-medium hover:underline">
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{order.contact_email}</td>
                  <td className="px-4 py-2">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-2">
                    {order.currency} {order.total}
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-neutral-400">{orders.count} total</p>
    </div>
  );
}
