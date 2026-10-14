import clsx from "clsx";
import type { OrderStatus, PaymentStatus, ProductStatus } from "@/lib/types";

type Tone = "green" | "amber" | "blue" | "rose" | "violet" | "gray";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-stat-green-bg text-stat-green-ink",
  amber: "bg-stat-amber-bg text-stat-amber-ink",
  blue: "bg-stat-blue-bg text-stat-blue-ink",
  rose: "bg-stat-rose-bg text-stat-rose-ink",
  violet: "bg-stat-violet-bg text-stat-violet-ink",
  gray: "bg-stat-gray-bg text-stat-gray-ink",
};

const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  awaiting_payment: "amber",
  payment_failed: "rose",
  paid: "green",
  processing: "blue",
  shipped: "violet",
  delivered: "green",
  cancelled: "gray",
  refunded: "rose",
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  pending: "amber",
  successful: "green",
  failed: "rose",
  refunded: "rose",
};

const PRODUCT_STATUS_TONE: Record<ProductStatus, Tone> = {
  draft: "gray",
  published: "green",
  archived: "rose",
};

function Badge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONE[status]} label={titleCase(status)} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONE[status]} label={titleCase(status)} />;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge tone={PRODUCT_STATUS_TONE[status]} label={titleCase(status)} />;
}
