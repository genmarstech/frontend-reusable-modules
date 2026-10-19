"use client";

import { useActionState, useState } from "react";

import type { Address } from "@/lib/api/types";
import { submitCheckoutAction, type CheckoutActionResult } from "./actions";

export function CheckoutForm({ storeSlug, addresses }: { storeSlug: string; addresses: Address[] }) {
  const [mode, setMode] = useState<"address" | "manual">(addresses.length > 0 ? "address" : "manual");
  const [state, formAction, pending] = useActionState<CheckoutActionResult, FormData>(
    submitCheckoutAction,
    {}
  );
  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="mode" value={mode} />

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {addresses.length > 0 && (
        <div className="flex gap-4 text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "address"}
              onChange={() => setMode("address")}
              name="mode-choice"
            />
            Use a saved address
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
              name="mode-choice"
            />
            Enter a new address
          </label>
        </div>
      )}

      {mode === "address" ? (
        <div>
          <label htmlFor="address_id" className="block text-sm font-medium text-neutral-700">
            Deliver to
          </label>
          <select
            id="address_id"
            name="address_id"
            defaultValue={defaultAddress?.id}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label ? `${address.label} — ` : ""}
                {address.recipient_name}, {address.line1}, {address.city}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Recipient name" name="delivery_recipient_name" autoComplete="name" required />
          <Field label="Address line 1" name="delivery_line1" autoComplete="address-line1" required />
          <Field label="Address line 2 (optional)" name="delivery_line2" autoComplete="address-line2" />
          <Field label="City" name="delivery_city" autoComplete="address-level2" required />
          <Field label="Delivery phone" name="delivery_phone" autoComplete="tel" required />
        </div>
      )}

      <Field label="Contact phone (optional)" name="contact_phone" autoComplete="tel" />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        autoComplete={autoComplete}
        required={required}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}
