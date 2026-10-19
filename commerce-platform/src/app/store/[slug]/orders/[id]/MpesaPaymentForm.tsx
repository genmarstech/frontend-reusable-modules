"use client";

import { useActionState, useId, useState } from "react";

import { initiatePaymentAction, type PaymentActionResult } from "./actions";

export function MpesaPaymentForm({
  storeSlug,
  orderId,
  orderReference,
}: {
  storeSlug: string;
  orderId: number;
  orderReference: string;
}) {
  const phoneFieldId = useId();
  const [phone, setPhone] = useState("");
  const [state, formAction, pending] = useActionState<PaymentActionResult, FormData>(
    initiatePaymentAction,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="orderReference" value={orderReference} />

      <div className="flex-1">
        <label htmlFor={phoneFieldId} className="block text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id={phoneFieldId}
          name="phone"
          type="tel"
          placeholder="07XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send prompt"}
      </button>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 sm:basis-full">
          {state.error}
        </p>
      )}
      {state.message && <p className="text-sm text-green-700 sm:basis-full">{state.message}</p>}
    </form>
  );
}
