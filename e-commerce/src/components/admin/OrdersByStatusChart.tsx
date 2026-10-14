"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OrderStatus } from "@/lib/types";

const LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function OrdersByStatusChart({ data }: { data: Partial<Record<OrderStatus, number>> }) {
  const rows = (Object.keys(LABELS) as OrderStatus[])
    .map((status) => ({ status: LABELS[status], count: data[status] ?? 0 }))
    .filter((row) => row.count > 0);

  if (rows.length === 0) {
    return <p className="flex h-64 items-center justify-center text-sm text-text-muted">No orders yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="status"
          width={110}
          tick={{ fontSize: 12, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
        />
        <Bar dataKey="count" fill="var(--admin-accent)" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
