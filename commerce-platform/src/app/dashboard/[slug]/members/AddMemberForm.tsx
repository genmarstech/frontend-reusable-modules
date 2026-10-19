"use client";

import { useActionState } from "react";

import { addMemberAction, type MemberActionResult } from "./actions";

const initialState: MemberActionResult = {};

export function AddMemberForm({ storeSlug }: { storeSlug: string }) {
  const [state, formAction, pending] = useActionState(addMemberAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 text-sm">
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <div>
        <label htmlFor="userId" className="block text-xs text-neutral-500">
          User id
        </label>
        <input
          id="userId"
          name="userId"
          type="number"
          min="1"
          required
          className="mt-1 w-28 rounded-md border border-neutral-300 px-2 py-1.5"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-xs text-neutral-500">
          Role
        </label>
        <select id="role" name="role" defaultValue="staff" className="mt-1 rounded-md border border-neutral-300 px-2 py-1.5">
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="w-full text-xs text-green-700">Added.</p>}
    </form>
  );
}
