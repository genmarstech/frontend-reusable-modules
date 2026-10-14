"use client";

import { useState } from "react";
import type { Address } from "@/lib/types";
import { Input } from "@/components/ui/Input";

export function AddressPicker({ addresses }: { addresses: Address[] }) {
  const [selected, setSelected] = useState<string>(
    addresses.find((a) => a.is_default)?.id.toString() ?? addresses[0]?.id.toString() ?? "new",
  );

  return (
    <div className="flex flex-col gap-3">
      {addresses.map((address) => (
        <label
          key={address.id}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-ink"
        >
          <input
            type="radio"
            name="address_id"
            value={address.id}
            checked={selected === address.id.toString()}
            onChange={() => setSelected(address.id.toString())}
            className="mt-1"
          />
          <div className="text-sm">
            <p className="font-medium text-text">
              {address.recipient_name} {address.label && `· ${address.label}`}
            </p>
            <p className="text-text-muted">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}
            </p>
            <p className="text-text-muted">{address.phone_number}</p>
          </div>
        </label>
      ))}

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 has-[:checked]:border-ink">
        <input
          type="radio"
          name="address_id"
          value="new"
          checked={selected === "new"}
          onChange={() => setSelected("new")}
        />
        <span className="text-sm font-medium text-text">Deliver somewhere new</span>
      </label>

      {selected === "new" && (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <Input id="delivery_recipient_name" name="delivery_recipient_name" label="Recipient name" required />
          <Input id="delivery_line1" name="delivery_line1" label="Address line 1" required />
          <Input id="delivery_line2" name="delivery_line2" label="Address line 2 (optional)" />
          <Input id="delivery_city" name="delivery_city" label="City" required />
          <Input id="delivery_phone" name="delivery_phone" label="Delivery phone" required />
        </div>
      )}
    </div>
  );
}
