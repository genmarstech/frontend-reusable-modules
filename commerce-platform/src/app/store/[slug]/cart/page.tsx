import Link from "next/link";
import { redirect } from "next/navigation";

import { getCart } from "@/lib/api/cart";
import { ApiError, NetworkError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { removeCartItemAction, updateCartItemAction } from "./actions";

/**
 * Reached only once proxy.ts's session gate has already let the request
 * through (see requiresAccountIn() there) — `getAccessToken()` here is a
 * plain cookie read, same backstop-not-authority relationship session.ts's
 * own comment describes for dashboard/page.tsx.
 *
 * `instant = false` — same reasoning as every other per-request storefront
 * page in this module: a cart is per-user, per-business, authorization-
 * gated data with no static shell worth prerendering ahead of the request.
 */
export const instant = false;
export default async function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(`/store/${slug}/cart`)}`);
  }

  let cart: Awaited<ReturnType<typeof getCart>>;
  try {
    cart = await getCart(accessToken, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/store/${slug}/cart`)}&reason=session_expired`);
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the store" detail={error.message} />;
    }
    throw error;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-lg font-semibold">Your cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Nothing added yet."
        />
        <Link href={`/store/${slug}`} className="text-sm font-medium text-neutral-900 underline underline-offset-2">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold">Your cart</h1>

      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
              <p className="text-sm text-neutral-500">{formatPrice(item.unit_price)} each</p>
            </div>

            <div className="flex items-center gap-3">
              <form action={updateCartItemAction.bind(null, slug, item.id)} className="flex items-center gap-2">
                <label htmlFor={`quantity-${item.id}`} className="sr-only">
                  Quantity for {item.product_name}
                </label>
                <input
                  id={`quantity-${item.id}`}
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                  className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Update
                </button>
              </form>

              <form action={removeCartItemAction.bind(null, slug, item.id)}>
                <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <span className="text-sm font-medium text-neutral-700">Subtotal</span>
        <span className="text-base font-semibold text-neutral-900">{formatPrice(cart.subtotal)}</span>
      </div>

      <Link
        href={`/store/${slug}/checkout`}
        className="block w-full rounded-md bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Checkout
      </Link>
    </div>
  );
}
