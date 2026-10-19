import { ApiError, NetworkError } from "@/lib/api/client";
import { listOpsCustomers } from "@/lib/api/ops/customers";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { EmptyState, ErrorState } from "@/components/ui/States";

export const instant = false;
export default async function OpsCustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const accessToken = (await getAccessToken())!;

  let customers;
  try {
    customers = await listOpsCustomers(accessToken, slug, q);
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
      <h2 className="text-base font-semibold">Customers</h2>
      <p className="text-xs text-neutral-500">
        This business&apos;s own customers only — order count and lifetime total reflect orders placed here,
        even for someone who has also shopped at another business on this platform.
      </p>

      <form className="flex gap-2 text-sm" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, phone…"
          className="rounded-md border border-neutral-300 px-3 py-1.5"
        />
        <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white">
          Search
        </button>
      </form>

      {customers.results.length === 0 ? (
        <EmptyState title="No customers match" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Orders</th>
                <th className="px-4 py-2">Lifetime total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {customers.results.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-2">
                    {customer.first_name || customer.last_name
                      ? `${customer.first_name} ${customer.last_name}`.trim()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{customer.email}</td>
                  <td className="px-4 py-2 text-neutral-600">{customer.phone_number || "—"}</td>
                  <td className="px-4 py-2">{customer.order_count}</td>
                  <td className="px-4 py-2">{formatPrice(customer.lifetime_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-neutral-400">{customers.count} total</p>
    </div>
  );
}
