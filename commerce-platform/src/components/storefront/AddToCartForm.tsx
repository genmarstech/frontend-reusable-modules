"use client";

import { useActionState, useId, useState } from "react";

import { addToCartAction, type CartActionResult } from "@/app/store/[slug]/cart/actions";

/**
 * The one piece of the product page that needs a session at all. An
 * anonymous visitor can submit this — there's no reason to hide it behind a
 * sign-in wall just to browse — and the action itself (requireAccessToken)
 * sends them to /login with `next` pointing back at this exact product, same
 * as any other protected mutation in this app.
 *
 * `compact`: the grocery theme's product-grid card (ProductCard.tsx) wants
 * a single quick-add button, no visible quantity stepper, without this
 * component or the server action it calls changing at all — quantity is
 * still submitted as a plain hidden `1`, same request shape as the full
 * form sends for its own default quantity. `returnPath` is the current
 * page, not the product detail page, when embedded in a grid card, so a
 * sign-in redirect for an anonymous visitor comes back to the grid they
 * were actually looking at, not a page they never opened.
 */
export function AddToCartForm({
  storeSlug,
  productId,
  variantId,
  returnPath,
  compact = false,
  accentClassName,
}: {
  storeSlug: string;
  productId: number;
  variantId?: number;
  returnPath?: string;
  compact?: boolean;
  accentClassName?: string;
}) {
  const quantityFieldId = useId();
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, pending] = useActionState<CartActionResult, FormData>(addToCartAction, {});
  const accent = accentClassName ?? "bg-neutral-900 hover:bg-neutral-800";

  return (
    <form
      action={formAction}
      className={compact ? "" : "space-y-2"}
      // Grocery-theme cards embed this inside the card's own <Link> to the
      // product page (ProductCard.tsx) — without stopping propagation, a
      // click on the "+" button bubbles up to that Link and navigates away
      // before the form's own submit does anything useful.
      onClick={compact ? (e) => e.stopPropagation() : undefined}
    >
      <input type="hidden" name="storeSlug" value={storeSlug} />
      <input type="hidden" name="productId" value={productId} />
      {variantId !== undefined && <input type="hidden" name="variantId" value={variantId} />}
      <input
        type="hidden"
        name="returnPath"
        value={returnPath ?? `/store/${storeSlug}/products/${productId}`}
      />

      {compact ? (
        <>
          <input type="hidden" name="quantity" value={1} />
          <button
            type="submit"
            disabled={pending}
            aria-label="Add to cart"
            className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accent}`}
          >
            {pending ? "…" : "+"}
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <label htmlFor={quantityFieldId} className="text-sm font-medium text-neutral-700">
            Qty
          </label>
          <input
            id={quantityFieldId}
            name="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accent}`}
          >
            {pending ? "Adding…" : "Add to cart"}
          </button>
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && !compact && <p className="text-sm text-green-700">Added to your cart.</p>}
    </form>
  );
}
