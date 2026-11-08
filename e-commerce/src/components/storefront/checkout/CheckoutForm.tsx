"use client";

import { useActionState } from "react";
import type { Address } from "@/lib/types";
import { submitCheckout, type CheckoutState } from "@/app/(storefront)/checkout/actions";
import { AddressPicker } from "./AddressPicker";
import { Button } from "@/components/ui/Button";

const initialState: CheckoutState = { error: null };

export function CheckoutForm({ addresses, defaultPhone }: { addresses: Address[]; defaultPhone: string }) {
  const [state, formAction, isPending] = useActionState(submitCheckout, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-text">Delivery address</h2>
        <AddressPicker addresses={addresses} defaultPhone={defaultPhone} />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" size="lg" loading={isPending}>
        Place order
      </Button>
    </form>
  );
}
