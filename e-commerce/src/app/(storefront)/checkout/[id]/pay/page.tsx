import { notFound } from "next/navigation";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import type { Order } from "@/lib/types";
import { PaymentPanel } from "@/components/storefront/checkout/PaymentPanel";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order: Order;
  try {
    order = await djangoFetch<Order>(`/api/orders/${id}/`, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-text">Complete your payment</h1>
      <PaymentPanel initialOrder={order} />
    </div>
  );
}
