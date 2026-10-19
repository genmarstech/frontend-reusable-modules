"use client";

import { useActionState } from "react";

import { adjustStockAction, type InventoryActionResult } from "./actions";

const initialState: InventoryActionResult = {};
const REASONS = ["restock", "return", "adjustment"];

export function AdjustStockForm({ storeSlug, recordId }: { storeSlug: string; recordId: number }) {
  const [state, formAction, pending] = useActionState(adjustStockAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 text-xs">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="recordId" value={recordId} />
      <input
        name="delta"
        type="number"
        step="1"
        placeholder="±qty"
        required
        className="w-20 rounded-md border border-neutral-300 px-2 py-1"
      />
      <select name="reason" defaultValue="adjustment" className="rounded-md border border-neutral-300 px-2 py-1">
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        name="note"
        type="text"
        placeholder="Note (optional)"
        className="w-32 rounded-md border border-neutral-300 px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-2 py-1 font-medium text-white disabled:opacity-50"
      >
        {pending ? "…" : "Apply"}
      </button>
      {state.error && <p className="w-full text-red-600">{state.error}</p>}
    </form>
  );
}
