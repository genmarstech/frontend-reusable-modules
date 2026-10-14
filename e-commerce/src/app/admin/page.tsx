import Link from "next/link";
import { DollarSign, Package, AlertTriangle, ClipboardList } from "lucide-react";
import { djangoFetch } from "@/lib/django";
import type { DashboardSummary } from "@/lib/types";
import { StatCard } from "@/components/admin/StatCard";
import { OrdersByStatusChart } from "@/components/admin/OrdersByStatusChart";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { Card, CardBody } from "@/components/ui/Card";
import { formatDateShort, formatMoney } from "@/lib/format";

export default async function AdminDashboardPage() {
  const summary = await djangoFetch<DashboardSummary>("/api/ops/dashboard/", { cache: "no-store" });
  const totalOrders = Object.values(summary.orders_by_status).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total sales" value={formatMoney(summary.sales_total)} tone="green" />
        <StatCard icon={ClipboardList} label="Total orders" value={totalOrders} tone="blue" />
        <StatCard icon={Package} label="Awaiting payment" value={summary.orders_by_status.awaiting_payment ?? 0} tone="amber" />
        <StatCard icon={AlertTriangle} label="Low stock items" value={summary.low_stock_count} tone="rose" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardBody>
            <h2 className="mb-4 text-sm font-semibold text-text">Orders by status</h2>
            <OrdersByStatusChart data={summary.orders_by_status} />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            </div>
            {summary.recent_orders.length === 0 ? (
              <EmptyState title="No orders yet" className="py-10" />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {summary.recent_orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between py-3 text-sm hover:opacity-70"
                  >
                    <div>
                      <p className="font-medium text-text">{order.reference}</p>
                      <p className="text-xs text-text-muted">{formatDateShort(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text">{formatMoney(order.total, order.currency)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
