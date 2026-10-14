import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { djangoFetch, toQuery } from "@/lib/django";
import { getCurrentUser } from "@/lib/session";
import type { Paginated, OrderSummary } from "@/lib/types";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateShort, formatMoney } from "@/lib/format";

const PAGE_SIZE = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  const orders = await djangoFetch<Paginated<OrderSummary>>(`/api/orders/${toQuery({ page })}`, {
    cache: "no-store",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-text">Your orders</h1>

      {orders.results.length === 0 ? (
        <EmptyState icon={Receipt} tone="blue" title="No orders yet" description="Your order history will show up here." className="mt-8" />
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-3">
            {orders.results.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-border p-5 hover:border-ink"
              >
                <div>
                  <p className="font-medium text-text">{order.reference}</p>
                  <p className="text-sm text-text-muted">{formatDateShort(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-text">{formatMoney(order.total, order.currency)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} count={orders.count} basePath="/orders" />
        </div>
      )}
    </div>
  );
}
