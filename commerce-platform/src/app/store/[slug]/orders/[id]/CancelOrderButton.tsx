"use client";

import { useActionState } from "react";

import { cancelOrderAction, type OrderActionResult } from "./actions";

export function CancelOrderButton({ storeSlug, orderId }: { storeSlug: string; orderId: number }) {
  const [state, formAction, pending] = useActionState<OrderActionResult, FormData>(cancelOrderAction, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Cancelling…" : "Cancel order"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
