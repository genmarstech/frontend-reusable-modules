"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { cancelOrder } from "@/app/(storefront)/orders/actions";

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleCancel() {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <Button variant="danger" size="sm" onClick={handleCancel} loading={isPending}>
      Cancel order
    </Button>
  );
}
