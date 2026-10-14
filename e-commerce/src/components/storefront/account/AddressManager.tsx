"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { deleteAddress, saveAddress, type ActionState } from "@/app/(storefront)/account/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/providers/ToastProvider";

const initialState: ActionState = { error: null };

function AddressForm({ address, onDone }: { address: Address | null; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState(saveAddress, initialState);
  const toast = useToast();
  const prevPending = useRef(isPending);

  useEffect(() => {
    if (prevPending.current && !isPending && !state.error) onDone();
    if (prevPending.current && !isPending && state.error) toast.error(state.error);
    prevPending.current = isPending;
  }, [isPending, state, onDone, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {address && <input type="hidden" name="id" value={address.id} />}
      <Input id="label" name="label" label="Label (optional)" placeholder="Home, Office…" defaultValue={address?.label} />
      <Input id="recipient_name" name="recipient_name" label="Recipient name" defaultValue={address?.recipient_name} required />
      <Input id="phone_number" name="phone_number" label="Phone" defaultValue={address?.phone_number} required />
      <Input id="line1" name="line1" label="Address line 1" defaultValue={address?.line1} required />
      <Input id="line2" name="line2" label="Address line 2" defaultValue={address?.line2} />
      <Input id="city" name="city" label="City" defaultValue={address?.city} required />
      <label className="flex items-center gap-2 text-sm text-text">
        <input type="checkbox" name="is_default" defaultChecked={address?.is_default} />
        Set as default
      </label>
      <Button type="submit" loading={isPending} className="mt-2">
        Save address
      </Button>
    </form>
  );
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | null | "new">(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">Saved addresses</h2>
        <Button variant="secondary" size="sm" onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add one to speed up checkout." />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between rounded-xl border border-border p-4">
              <div className="text-sm">
                <p className="font-medium text-text">
                  {address.recipient_name} {address.is_default && <span className="text-accent">· Default</span>}
                </p>
                <p className="text-text-muted">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}
                </p>
                <p className="text-text-muted">{address.phone_number}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(address)} className="rounded-full p-2 text-text-muted hover:bg-bg-sunken" aria-label="Edit">
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => startTransition(() => deleteAddress(address.id))}
                  disabled={isPending}
                  className="rounded-full p-2 text-text-muted hover:bg-bg-sunken hover:text-danger"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add address" : "Edit address"}>
        <AddressForm address={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
      </Modal>
    </div>
  );
}
