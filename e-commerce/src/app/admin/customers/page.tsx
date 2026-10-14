import { djangoFetch, toQuery } from "@/lib/django";
import type { Customer, Paginated } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateShort, formatMoney } from "@/lib/format";

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const customers = await djangoFetch<Paginated<Customer>>(`/api/ops/customers/${toQuery({ search: params.search, page })}`, {
    cache: "no-store",
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Customers</h1>

      <form action="/admin/customers" method="get" className="max-w-xs">
        <Input id="search" name="search" placeholder="Search name, email, phone…" defaultValue={params.search} />
      </form>

      <Card>
        {customers.results.length === 0 ? (
          <EmptyState title="No customers found" className="border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Lifetime value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.results.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-5 py-3 font-medium text-text">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-5 py-3 text-text-muted">{customer.email}</td>
                    <td className="px-5 py-3 text-text-muted">{customer.phone_number}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDateShort(customer.date_joined)}</td>
                    <td className="px-5 py-3 text-text">{customer.order_count}</td>
                    <td className="px-5 py-3 text-text">{formatMoney(customer.lifetime_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} pageSize={PAGE_SIZE} count={customers.count} basePath={`/admin/customers${toQuery({ search: params.search })}`} />
    </div>
  );
}
