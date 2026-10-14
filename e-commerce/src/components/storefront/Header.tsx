import Link from "next/link";
import { ShoppingBag, User as UserIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import type { Cart } from "@/lib/types";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/orders", label: "Orders" },
];

async function getCartCount(): Promise<number> {
  try {
    const cart = await djangoFetch<Cart>("/api/cart/");
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    if (error instanceof ApiRequestError && error.isUnauthorized) return 0;
    return 0;
  }
}

export async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount() : 0;

  return (
    <header className="relative border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-text">
            genmars<span className="text-accent">store</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-text-muted hover:text-text">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-text hover:bg-bg-sunken"
          >
            <UserIcon className="size-4" />
            <span className="hidden sm:inline">{user ? user.first_name || "Account" : "Sign in"}</span>
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-text hover:bg-bg-sunken"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
