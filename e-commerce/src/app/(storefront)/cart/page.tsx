import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { djangoFetch } from "@/lib/django";
import { getCurrentUser } from "@/lib/session";
import type { Cart } from "@/lib/types";
import { CartItemRow } from "@/components/storefront/CartItemRow";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");

  const cart = await djangoFetch<Cart>("/api/cart/", { cache: "no-store" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-text">Your cart</h1>

      {cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something you like in the shop."
          action={
            <Link href="/shop">
              <Button variant="secondary">Browse the shop</Button>
            </Link>
          }
          className="mt-8"
        />
      ) : (
        <div className="mt-8">
          <div className="rounded-2xl border border-border px-5">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span className="text-xl font-semibold text-text">{formatMoney(cart.subtotal)}</span>
          </div>

          <Link href="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              Proceed to checkout
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
