import Link from "next/link";
import { redirect } from "next/navigation";

import { listOrders } from "@/lib/api/orders";
import { ApiError, NetworkError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";

/** `instant = false` — same per-request, authorization-gated reasoning as
 * every other protected storefront page in this module. */
export const instant = false;
export default async function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(`/store/${slug}/orders`)}`);
  }

  let orders: Awaited<ReturnType<typeof listOrders>>;
  try {
    orders = await listOrders(accessToken, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/store/${slug}/orders`)}&reason=session_expired`);
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the store" detail={error.message} />;
    }
    throw error;
  }

  if (orders.results.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-lg font-semibold">Your orders</h1>
        <EmptyState title="No orders yet" description="Orders you place with this store will show up here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">Your orders</h1>
      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {orders.results.map((order) => (
          <li key={order.id}>
            <Link
              href={`/store/${slug}/orders/${order.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{order.reference}</p>
                <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">{formatPrice(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
