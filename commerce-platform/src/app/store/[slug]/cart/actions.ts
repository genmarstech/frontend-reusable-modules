"use server";

import { revalidatePath } from "next/cache";

import { addCartItem, removeCartItem, updateCartItem } from "@/lib/api/cart";
import { ApiError, NetworkError } from "@/lib/api/client";
import { clearSessionAndRedirectToLogin, requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface CartActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Bound to a <form action={...}> via useActionState in AddToCartForm, so its
 * signature is (previousState, formData) — everything it needs travels as
 * hidden form fields rather than bound arguments, which is what lets it also
 * report an inline error/success back to that same form instead of throwing
 * to the nearest error boundary for an entirely expected case (stock isn't
 * checked here — see cart/serializers.py — but a product going unpublished
 * between page load and submit still returns a 400).
 */
export async function addToCartAction(
  _previousState: CartActionResult,
  formData: FormData
): Promise<CartActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const productId = Number(formData.get("productId"));
  const variantRaw = formData.get("variantId");
  const variant = variantRaw ? Number(variantRaw) : undefined;
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  const returnPath = String(formData.get("returnPath"));

  const accessToken = await requireAccessToken(returnPath);

  try {
    await addCartItem(accessToken, storeSlug, { product: productId, variant, quantity });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionAndRedirectToLogin(returnPath);
    }
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    if (error instanceof NetworkError) {
      return { error: error.message };
    }
    throw error;
  }

  // Doesn't revalidate `returnPath` itself (the product page) — nothing
  // about a product's own render output depends on cart contents, only the
  // cart page's does.
  revalidatePath(`/store/${storeSlug}/cart`);
  return { success: true };
}

/**
 * Plain progressive-enhancement form actions for the cart page itself — no
 * client JS required, so no useActionState here; an unexpected error
 * surfaces to store/[slug]/error.tsx same as any other page-level bug.
 * `.bind(null, storeSlug, itemId)` from the cart page gives these their
 * actual (storeSlug, itemId, formData) call shape.
 */
export async function updateCartItemAction(storeSlug: string, itemId: number, formData: FormData) {
  const returnPath = `/store/${storeSlug}/cart`;
  const accessToken = await requireAccessToken(returnPath);

  const quantity = Number(formData.get("quantity"));
  if (!Number.isFinite(quantity) || quantity < 1) {
    // The number input already carries min="1" — reaching this means the
    // field was tampered with client-side; silently refusing (rather than
    // clamping to something arbitrary) is the safe default for a form this
    // vestigial.
    return;
  }

  try {
    await updateCartItem(accessToken, storeSlug, itemId, quantity);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionAndRedirectToLogin(returnPath);
    }
    throw error;
  }
  revalidatePath(returnPath);
}

export async function removeCartItemAction(storeSlug: string, itemId: number) {
  const returnPath = `/store/${storeSlug}/cart`;
  const accessToken = await requireAccessToken(returnPath);

  try {
    await removeCartItem(accessToken, storeSlug, itemId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearSessionAndRedirectToLogin(returnPath);
    }
    throw error;
  }
  revalidatePath(returnPath);
}
