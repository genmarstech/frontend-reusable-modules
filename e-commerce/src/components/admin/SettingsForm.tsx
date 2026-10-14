"use client";

import { useActionState, useEffect, useRef } from "react";
import type { StoreSettings } from "@/lib/types";
import { saveSettings, type ActionState } from "@/app/admin/settings/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

const initialState: ActionState = { error: null };

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const toast = useToast();
  const prevPending = useRef(isPending);

  useEffect(() => {
    if (prevPending.current && !isPending) {
      if (state.error) toast.error(state.error);
      else toast.success("Settings saved.");
    }
    prevPending.current = isPending;
  }, [isPending, state, toast]);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <Input id="currency" name="currency" label="Currency code" defaultValue={settings.currency} maxLength={3} required />
      <Input
        id="default_delivery_fee"
        name="default_delivery_fee"
        label="Default delivery fee"
        type="number"
        step="0.01"
        min="0"
        defaultValue={settings.default_delivery_fee}
        required
      />
      <Input
        id="low_stock_default_threshold"
        name="low_stock_default_threshold"
        label="Low-stock threshold (default)"
        type="number"
        min="0"
        defaultValue={settings.low_stock_default_threshold}
        required
      />
      <Button type="submit" loading={isPending} className="self-start">
        Save settings
      </Button>
    </form>
  );
}
