"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { updateCartItemQuantity, removeCartItem } from "@/app/(storefront)/cart/actions";

export function CartItemRow({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 border-b border-border py-5 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-text">{item.product_name}</p>
        <p className="text-sm text-text-muted">{formatMoney(item.unit_price)}</p>
      </div>

      <div className="flex items-center rounded-full border border-border">
        <button
          onClick={() => startTransition(() => updateCartItemQuantity(item.id, item.quantity - 1))}
          className="size-8 rounded-full text-text hover:bg-bg-sunken"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{isPending ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : item.quantity}</span>
        <button
          onClick={() => startTransition(() => updateCartItemQuantity(item.id, item.quantity + 1))}
          className="size-8 rounded-full text-text hover:bg-bg-sunken"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <p className="w-20 text-right text-sm font-medium text-text">
        {formatMoney(Number(item.unit_price) * item.quantity)}
      </p>

      <button
        onClick={() => startTransition(() => removeCartItem(item.id))}
        className="text-text-muted hover:text-danger"
        aria-label="Remove item"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
