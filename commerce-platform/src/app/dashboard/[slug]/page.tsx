import Link from "next/link";

import { ApiError, NetworkError } from "@/lib/api/client";
import { getDashboard } from "@/lib/api/businesses";
import { getAccessToken } from "@/lib/auth/session";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";
import type { DashboardSummary } from "@/lib/api/types";

export const instant = false;
export default async function BusinessOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = (await getAccessToken())!; // layout already redirected if missing

  let dashboard: DashboardSummary;
  try {
    dashboard = await getDashboard(accessToken, slug);
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
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Sales total" value={dashboard.sales_total} />
        <Stat label="Low stock items" value={String(dashboard.low_stock_count)} />
        {Object.entries(dashboard.orders_by_status).map(([status, count]) => (
          <Stat key={status} label={status.replace(/_/g, " ")} value={String(count)} />
        ))}
      </dl>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recent orders</h2>
          <Link href={`/dashboard/${slug}/orders`} className="text-xs text-neutral-500 hover:underline">
            View all
          </Link>
        </div>
        {dashboard.recent_orders.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <ul className="mt-2 divide-y divide-neutral-200 text-sm">
            {dashboard.recent_orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-2">
                <Link href={`/dashboard/${slug}/orders/${order.id}`} className="hover:underline">
                  {order.reference}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="text-neutral-500">
                    {order.currency} {order.total}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <dt className="text-xs capitalize text-neutral-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
