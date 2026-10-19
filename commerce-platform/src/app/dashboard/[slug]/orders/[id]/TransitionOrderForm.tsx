"use client";

import { useActionState } from "react";

import { transitionOrderAction, type TransitionActionResult } from "./actions";

const initialState: TransitionActionResult = {};

export function TransitionOrderForm({
  storeSlug,
  orderId,
  options,
}: {
  storeSlug: string;
  orderId: number;
  options: string[];
}) {
  const [state, formAction, pending] = useActionState(transitionOrderAction, initialState);

  if (options.length === 0) return null;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 text-sm">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label htmlFor="toStatus" className="block text-xs text-neutral-500">
          Move to
        </label>
        <select
          id="toStatus"
          name="toStatus"
          required
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5"
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="block text-xs text-neutral-500">
          Note (optional)
        </label>
        <input
          id="note"
          name="note"
          type="text"
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update status"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="w-full text-xs text-green-700">Updated.</p>}
    </form>
  );
}
