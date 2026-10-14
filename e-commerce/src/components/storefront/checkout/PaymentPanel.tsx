"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Smartphone, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { readableErrorMessage } from "@/lib/errors";

const PAYABLE_STATUSES = new Set(["awaiting_payment", "payment_failed"]);

async function fetchOrder(orderId: number): Promise<Order> {
  const response = await fetch(`/api/proxy/orders/${orderId}`);
  if (!response.ok) throw new Error("Could not load order status.");
  return response.json();
}

export function PaymentPanel({ initialOrder }: { initialOrder: Order }) {
  const [phone, setPhone] = useState(initialOrder.contact_phone);
  const [initiating, setInitiating] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const toast = useToast();

  const { data: order } = useQuery({
    queryKey: ["order", initialOrder.id],
    queryFn: () => fetchOrder(initialOrder.id),
    initialData: initialOrder,
    // Only poll once a prompt has actually been sent, and only while the
    // order is still in a payable state — Daraja's callback is what moves
    // it on, this is just watching for that to land.
    refetchInterval: (query) => (prompted && PAYABLE_STATUSES.has(query.state.data?.status ?? "") ? 3000 : false),
  });

  async function initiatePayment() {
    setInitiating(true);
    try {
      const response = await fetch("/api/proxy/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_reference: initialOrder.reference, phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(readableErrorMessage(data, "Could not start the M-Pesa prompt."));
        return;
      }
      setPrompted(true);
      toast.success("Check your phone for the M-Pesa prompt.");
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setInitiating(false);
    }
  }

  const status = order?.status ?? initialOrder.status;

  if (status === "paid" || status === "processing" || status === "shipped" || status === "delivered") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-stat-green-bg/50 p-10 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <p className="text-lg font-semibold text-text">Payment received</p>
        <p className="text-sm text-text-muted">Order {initialOrder.reference} is confirmed.</p>
        <Link href={`/orders/${initialOrder.id}`}>
          <Button className="mt-2">View order</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-8">
      <p className="text-sm text-text-muted">Order {initialOrder.reference}</p>
      <p className="mt-1 text-3xl font-semibold text-text">{formatMoney(initialOrder.total, initialOrder.currency)}</p>

      {status === "payment_failed" && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-stat-rose-bg px-3 py-2 text-sm text-stat-rose-ink">
          <XCircle className="size-4 shrink-0" /> The last attempt failed or was cancelled. Try again below.
        </p>
      )}

      {prompted && PAYABLE_STATUSES.has(status) ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
          <Smartphone className="size-8 animate-pulse text-accent" />
          <p className="font-medium text-text">Check your phone</p>
          <p className="text-sm text-text-muted">Enter your M-Pesa PIN to complete the payment.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <Input
            id="phone"
            label="M-Pesa phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678"
          />
          <Button onClick={initiatePayment} loading={initiating} size="lg">
            Pay with M-Pesa
          </Button>
        </div>
      )}
    </div>
  );
}
