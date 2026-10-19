"use client";

/**
 * A plain <select> inside a <form action={...}> can't auto-submit on
 * change without a client-side event handler, which a Server Component
 * can't attach directly — this is the smallest client island that can.
 */
export function RoleSelect({ defaultRole }: { defaultRole: string }) {
  return (
    <select
      name="role"
      defaultValue={defaultRole}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
    >
      <option value="owner">Owner</option>
      <option value="manager">Manager</option>
      <option value="staff">Staff</option>
    </select>
  );
}
