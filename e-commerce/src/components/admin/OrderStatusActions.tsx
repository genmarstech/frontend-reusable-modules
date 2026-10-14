"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { transitionOrder } from "@/app/admin/orders/actions";

// Mirrors orders/services.py's ALLOWED_TRANSITIONS — the backend is still
// the one enforcing this (a rejected transition comes back as a toast), but
// only showing valid next steps keeps the admin from clicking through a
// wall of buttons that are guaranteed to fail.
interface Step {
  status: OrderStatus;
  label: string;
  /** Past tense, for the confirmation toast — "Order shipped.", not a
   * mechanically lower-cased button label ("Order mark shipped."). */
  done: string;
  variant?: "danger";
}

const NEXT_STEPS: Partial<Record<OrderStatus, Step[]>> = {
  awaiting_payment: [{ status: "cancelled", label: "Cancel order", done: "cancelled", variant: "danger" }],
  payment_failed: [{ status: "cancelled", label: "Cancel order", done: "cancelled", variant: "danger" }],
  paid: [
    { status: "processing", label: "Start processing", done: "moved to processing" },
    { status: "cancelled", label: "Cancel", done: "cancelled", variant: "danger" },
    { status: "refunded", label: "Refund", done: "refunded", variant: "danger" },
  ],
  processing: [
    { status: "shipped", label: "Mark shipped", done: "shipped" },
    { status: "cancelled", label: "Cancel", done: "cancelled", variant: "danger" },
    { status: "refunded", label: "Refund", done: "refunded", variant: "danger" },
  ],
  shipped: [
    { status: "delivered", label: "Mark delivered", done: "delivered" },
    { status: "refunded", label: "Refund", done: "refunded", variant: "danger" },
  ],
  delivered: [{ status: "refunded", label: "Refund", done: "refunded", variant: "danger" }],
};

export function OrderStatusActions({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const steps = NEXT_STEPS[status] ?? [];
  if (steps.length === 0) return null;

  function apply(step: Step) {
    if ((step.status === "cancelled" || step.status === "refunded") && !confirm(`${step.label}? This restores stock and can't be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await transitionOrder(orderId, step.status);
      if (result.error) toast.error(result.error);
      else toast.success(`Order ${step.done}.`);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step) => (
        <Button key={step.status} size="sm" variant={step.variant ?? "secondary"} loading={isPending} onClick={() => apply(step)}>
          {step.label}
        </Button>
      ))}
    </div>
  );
}
