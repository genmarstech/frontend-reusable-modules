import type { OrderStatus } from "@/lib/api/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-600">
      {status.replace(/_/g, " ")}
    </span>
  );
}
