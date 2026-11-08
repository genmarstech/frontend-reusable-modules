"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import type { Address } from "@/lib/types";
import { Input } from "@/components/ui/Input";

function NewAddressFields({ defaultPhone }: { defaultPhone?: string }) {
  const [showMoreDetail, setShowMoreDetail] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Input id="delivery_recipient_name" name="delivery_recipient_name" label="Recipient name" required />
        <Input
          id="delivery_phone"
          name="delivery_phone"
          label="Phone number"
          hint="Used for delivery and M-Pesa"
          defaultValue={defaultPhone}
          required
        />
      </div>
      <Input id="delivery_line1" name="delivery_line1" label="Delivery address" placeholder="Street, estate, building" required />
      <Input id="delivery_city" name="delivery_city" label="Town / City" required />

      {showMoreDetail ? (
        <Input id="delivery_line2" name="delivery_line2" label="Apartment, suite, delivery note (optional)" />
      ) : (
        <button
          type="button"
          onClick={() => setShowMoreDetail(true)}
          className="inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:underline"
        >
          <Plus className="size-3.5" />
          Add apartment, suite, or delivery note
        </button>
      )}
    </div>
  );
}

export function AddressPicker({ addresses, defaultPhone }: { addresses: Address[]; defaultPhone?: string }) {
  const [selected, setSelected] = useState<string>(
    addresses.find((a) => a.is_default)?.id.toString() ?? addresses[0]?.id.toString() ?? "new",
  );

  // Nothing saved yet — the overwhelmingly common first-checkout case.
  // Showing a radio picker with exactly one option ("deliver somewhere
  // new", pre-selected) is pure chrome with nothing to actually pick
  // between, so skip it and go straight to the fields.
  if (addresses.length === 0) {
    return <NewAddressFields defaultPhone={defaultPhone} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((address) => (
        <label
          key={address.id}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40"
        >
          <input
            type="radio"
            name="address_id"
            value={address.id}
            checked={selected === address.id.toString()}
            onChange={() => setSelected(address.id.toString())}
            className="mt-1 accent-accent"
          />
          <MapPin className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <div className="text-sm">
            <p className="font-medium text-text">
              {address.recipient_name} {address.label && <span className="text-text-muted">· {address.label}</span>}
            </p>
            <p className="text-text-muted">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}
            </p>
            <p className="text-text-muted">{address.phone_number}</p>
          </div>
        </label>
      ))}

      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm font-medium text-text-muted hover:text-text has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40 has-[:checked]:text-text">
        <input
          type="radio"
          name="address_id"
          value="new"
          checked={selected === "new"}
          onChange={() => setSelected("new")}
          className="accent-accent"
        />
        <Plus className="size-4" />
        Deliver somewhere new
      </label>

      {selected === "new" && <NewAddressFields defaultPhone={defaultPhone} />}
    </div>
  );
}
