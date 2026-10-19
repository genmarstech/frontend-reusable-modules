import Link from "next/link";

import type { User } from "@/lib/api/types";
import type { ThemeConfig } from "@/lib/themes/types";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * `user` is this app's own BFF session (session.ts::getCurrentUser()), not
 * anything business-specific — the same account signs in across every
 * store on this platform. A signed-out visitor still sees Cart/Orders
 * links; following either one is what sends them to /login (proxy.ts's own
 * gate on those three paths), same as clicking any other protected link
 * while signed out.
 *
 * `themeConfig` only touches the store name's own typography/color here —
 * structure (what links exist, their order) stays identical across every
 * theme on purpose. A nav that reshuffles itself per theme would make the
 * platform's own account/cart/orders links harder to find on some stores
 * than others for no real benefit.
 */
export function StoreHeader({
  storeSlug,
  storeName,
  themeConfig,
  user,
}: {
  storeSlug: string;
  storeName: string;
  themeConfig: ThemeConfig;
  user: User | null;
}) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 pb-6">
      <Link
        href={`/store/${storeSlug}`}
        className={`text-lg font-semibold tracking-tight ${themeConfig.headingFontClassName} ${themeConfig.accentTextClassName}`}
      >
        {storeName}
      </Link>

      <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
        <Link href={`/store/${storeSlug}/orders`} className="hover:text-neutral-900">
          Orders
        </Link>
        <Link href={`/store/${storeSlug}/cart`} className="hover:text-neutral-900">
          Cart
        </Link>
        {user ? (
          <LogoutButton />
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/store/${storeSlug}`)}`}
            className="hover:text-neutral-900"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
