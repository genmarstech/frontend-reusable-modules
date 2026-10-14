import Link from "next/link";
import { djangoFetch, toQuery } from "@/lib/django";
import type { OrderStatus, OrderSummary, Paginated } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateShort, formatMoney } from "@/lib/format";

const PAGE_SIZE = 20;
const STATUSES: OrderStatus[] = [
  "awaiting_payment", "payment_failed", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const orders = await djangoFetch<Paginated<OrderSummary>>(
    `/api/ops/orders/${toQuery({ search: params.search, status: params.status, page })}`,
    { cache: "no-store" },
  );

  const basePath = `/admin/orders${toQuery({ search: params.search, status: params.status })}`;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Orders</h1>

      <form action="/admin/orders" method="get" className="flex flex-wrap items-end gap-3">
        <Input id="search" name="search" placeholder="Search reference or email…" defaultValue={params.search} className="w-64" />
        <Select id="status" name="status" defaultValue={params.status ?? ""} className="w-48">
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <Card>
        {orders.results.length === 0 ? (
          <EmptyState title="No orders found" className="border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.results.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-text hover:text-accent">
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{order.contact_email}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDateShort(order.created_at)}</td>
                    <td className="px-5 py-3 text-text">{formatMoney(order.total, order.currency)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} pageSize={PAGE_SIZE} count={orders.count} basePath={basePath} />
    </div>
  );
}
