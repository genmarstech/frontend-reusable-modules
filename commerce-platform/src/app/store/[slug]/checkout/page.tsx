import Link from "next/link";
import { redirect } from "next/navigation";

import { listAddresses } from "@/lib/api/addresses";
import { getCart } from "@/lib/api/cart";
import { ApiError, NetworkError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format";
import { ErrorState } from "@/components/ui/States";
import { CheckoutForm } from "./CheckoutForm";

/** `instant = false` — same per-request, authorization-gated reasoning as
 * every other protected storefront page in this module. */
export const instant = false;
export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(`/store/${slug}/checkout`)}`);
  }

  let cart: Awaited<ReturnType<typeof getCart>>;
  let addresses: Awaited<ReturnType<typeof listAddresses>>;
  try {
    [cart, addresses] = await Promise.all([getCart(accessToken, slug), listAddresses(accessToken)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/store/${slug}/checkout`)}&reason=session_expired`);
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
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-lg font-semibold">Checkout</h1>
        <p className="text-sm text-neutral-600">Your cart is empty — add something before checking out.</p>
        <Link
          href={`/store/${slug}`}
          className="text-sm font-medium text-neutral-900 underline underline-offset-2"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
      <div>
        <h1 className="text-lg font-semibold">Delivery details</h1>
        <div className="mt-4">
          <CheckoutForm storeSlug={slug} addresses={addresses.results} />
        </div>
      </div>

      <div className="h-fit space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Order summary</h2>
        <ul className="divide-y divide-neutral-200 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatPrice(String(Number(item.unit_price) * item.quantity))}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        {/* The store's delivery fee (core/models.py::StoreSettings) has no
            public endpoint — only /api/ops/<slug>/settings/, owner/manager
            only. Showing a number here would mean guessing it; the real
            total appears on the order the next screen creates. */}
        <p className="text-xs text-neutral-500">
          A delivery fee set by the store is added automatically — the final total appears on your order
          once placed.
        </p>
      </div>
    </div>
  );
}
