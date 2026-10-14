import { redirect } from "next/navigation";
import { djangoFetch } from "@/lib/django";
import { getCurrentUser } from "@/lib/session";
import type { Address, Cart } from "@/lib/types";
import { CheckoutForm } from "@/components/storefront/checkout/CheckoutForm";
import { formatMoney } from "@/lib/format";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const [cart, addresses] = await Promise.all([
    djangoFetch<Cart>("/api/cart/", { cache: "no-store" }),
    djangoFetch<{ results: Address[] }>("/api/addresses/", { cache: "no-store" }),
  ]);

  if (cart.items.length === 0) redirect("/cart");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-text">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <CheckoutForm addresses={addresses.results} defaultPhone={user.phone_number} />

        <div className="h-fit rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Order summary</h2>
          <div className="flex flex-col gap-2 text-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-text-muted">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="text-text">{formatMoney(Number(item.unit_price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold text-text">
            <span>Subtotal</span>
            <span>{formatMoney(cart.subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-text-muted">Delivery fee and the final total are confirmed on the next step.</p>
        </div>
      </div>
    </div>
  );
}
