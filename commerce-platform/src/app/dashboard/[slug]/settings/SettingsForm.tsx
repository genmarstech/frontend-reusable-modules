"use client";

import { useActionState, useId, useState } from "react";

import { updateSettingsAction, type SettingsActionResult } from "./actions";
import type { StoreSettings } from "@/lib/api/types";
import { STORE_THEMES } from "@/lib/themes/types";
import { THEME_REGISTRY } from "@/lib/themes/registry";

const initialState: SettingsActionResult = {};

export function SettingsForm({ storeSlug, settings }: { storeSlug: string; settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const themeGroupName = useId();
  const [theme, setTheme] = useState(settings.theme);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <input type="hidden" name="storeSlug" value={storeSlug} />

      <fieldset>
        <legend className="block text-sm font-medium text-neutral-700">Storefront design</legend>
        <p className="mt-1 text-xs text-neutral-400">
          Changes how your storefront looks to customers — grid layout, card style and typography. Pick
          whichever best fits what you sell; you can change this again any time.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STORE_THEMES.map((key) => {
            const config = THEME_REGISTRY[key];
            const inputId = `${themeGroupName}-${key}`;
            return (
              <label
                key={key}
                htmlFor={inputId}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                  theme === key
                    ? "border-neutral-900 ring-1 ring-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="theme"
                  value={key}
                  checked={theme === key}
                  onChange={() => setTheme(key)}
                  className="sr-only"
                />
                <p className="font-medium text-neutral-900">{config.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{config.description}</p>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-neutral-700">
          Currency
        </label>
        <input
          id="currency"
          name="currency"
          type="text"
          maxLength={3}
          defaultValue={settings.currency}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase"
        />
      </div>

      <div>
        <label htmlFor="default_delivery_fee" className="block text-sm font-medium text-neutral-700">
          Default delivery fee
        </label>
        <input
          id="default_delivery_fee"
          name="default_delivery_fee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={settings.default_delivery_fee}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">Added to every order&apos;s total at checkout.</p>
      </div>

      <div>
        <label htmlFor="low_stock_default_threshold" className="block text-sm font-medium text-neutral-700">
          Low stock threshold
        </label>
        <input
          id="low_stock_default_threshold"
          name="low_stock_default_threshold"
          type="number"
          min="0"
          step="1"
          defaultValue={settings.low_stock_default_threshold}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Default for any inventory record that doesn&apos;t set its own threshold.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
