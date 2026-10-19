import Link from "next/link";

import { ApiError, NetworkError } from "@/lib/api/client";
import { listOpsPayments } from "@/lib/api/ops/payments";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { EmptyState, ErrorState } from "@/components/ui/States";

export const instant = false;
export default async function OpsPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const accessToken = (await getAccessToken())!;

  let payments;
  try {
    payments = await listOpsPayments(accessToken, slug, { status });
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
      <h2 className="text-base font-semibold">Payments</h2>
      <p className="text-xs text-neutral-500">
        Read-only — a payment is only ever written by the M-Pesa callback, never edited here.
      </p>

      <form className="flex gap-2 text-sm" method="get">
        <select name="status" defaultValue={status ?? ""} className="rounded-md border border-neutral-300 px-3 py-1.5">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white">
          Filter
        </button>
      </form>

      {payments.results.length === 0 ? (
        <EmptyState title="No payments match" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Receipt</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {payments.results.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/${slug}/orders/${payment.order}`} className="font-medium hover:underline">
                      Order #{payment.order}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {payment.currency} {formatPrice(payment.amount)}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{payment.phone_number}</td>
                  <td className="px-4 py-2 capitalize">{payment.status}</td>
                  <td className="px-4 py-2 text-neutral-600">{payment.receipt_number || "—"}</td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(payment.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-neutral-400">{payments.count} total</p>
    </div>
  );
}
