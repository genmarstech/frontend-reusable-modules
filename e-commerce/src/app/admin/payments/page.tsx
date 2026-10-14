import Link from "next/link";
import { djangoFetch, toQuery } from "@/lib/django";
import type { Paginated, Payment, PaymentStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatMoney } from "@/lib/format";

const PAGE_SIZE = 20;
const STATUSES: PaymentStatus[] = ["pending", "successful", "failed", "refunded"];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const payments = await djangoFetch<Paginated<Payment>>(
    `/api/ops/payments/${toQuery({ search: params.search, status: params.status, page })}`,
    { cache: "no-store" },
  );

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Payments</h1>

      <form action="/admin/payments" method="get" className="flex flex-wrap items-end gap-3">
        <Input id="search" name="search" placeholder="Order reference, receipt, phone…" defaultValue={params.search} className="w-64" />
        <Select id="status" name="status" defaultValue={params.status ?? ""} className="w-48">
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <Card>
        {payments.results.length === 0 ? (
          <EmptyState title="No payments found" className="border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.results.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-3 font-medium text-text">
                      <Link href={`/admin/orders/${payment.order}`} className="hover:text-accent">
                        #{payment.order}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{payment.phone_number}</td>
                    <td className="px-5 py-3 text-text-muted">{payment.receipt_number || "—"}</td>
                    <td className="px-5 py-3 text-text">{formatMoney(payment.amount, payment.currency)}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(payment.created_at)}</td>
                    <td className="px-5 py-3">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        count={payments.count}
        basePath={`/admin/payments${toQuery({ search: params.search, status: params.status })}`}
      />
    </div>
  );
}
