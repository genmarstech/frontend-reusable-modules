import { notFound } from "next/navigation";

import { listCategories } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { getStoreInfo } from "@/lib/api/store";
import { getCurrentUser } from "@/lib/auth/session";
import { displayNameFromSlug } from "@/lib/format";
import { getThemeConfig } from "@/lib/themes/registry";
import { resolveStoreTheme } from "@/lib/themes/types";
import { StoreHeader } from "@/components/storefront/StoreHeader";

/**
 * Every route under here shares one concern: does this slug name a real,
 * active business at all? `/categories/` is anonymous-readable and 404s
 * identically for an unknown slug or a suspended one (confirmed live, see
 * docs/API_CONTRACT.md) — exactly the check this layout needs, so it
 * doubles as that check rather than adding a second lookup. A slug is
 * never treated as authorization for anything beyond "this business
 * exists and is open" — every page below still calls the backend itself
 * for whatever it actually needs, scoped by this same slug.
 *
 * `notFound()` here means an unknown and a suspended business render the
 * identical page — deliberate, matching the API's own refusal to
 * distinguish them (see not-found.tsx).
 *
 * `instant = false`: without it, Cache Components mode (next.config.ts)
 * serves a static shell immediately (HTTP 200) and streams this layout's
 * business-existence check in afterward — by the time `notFound()` runs,
 * response headers are already sent, so the real HTTP status never
 * becomes 404 even though the rendered page is the not-found UI. Found
 * live: a curl against an unknown slug came back 200 with a "Loading…"
 * shell, not 404. Same root cause and same fix as dashboard/page.tsx's
 * own `instant = false` — every byte this layout decides on is per-
 * request (does this slug even exist right now), so there's no static
 * shell worth prerendering ahead of it anyway.
 */
export const instant = false;
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let user: Awaited<ReturnType<typeof getCurrentUser>>;
  let storeName = displayNameFromSlug(slug);
  let theme = resolveStoreTheme(undefined);
  try {
    const [, resolvedUser, storeInfo] = await Promise.all([
      listCategories(slug),
      getCurrentUser(),
      // Same 404-on-unknown-or-suspended-slug resolution as listCategories
      // (core/views.py::PublicStoreInfoView shares BusinessScopedMixin with
      // every other public endpoint) — either one failing is equally valid
      // proof this slug doesn't name a real, open business.
      getStoreInfo(slug),
    ]);
    user = resolvedUser;
    storeName = storeInfo.name;
    theme = resolveStoreTheme(storeInfo.theme);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const themeConfig = getThemeConfig(theme);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <StoreHeader storeSlug={slug} storeName={storeName} themeConfig={themeConfig} user={user} />
      {children}
    </div>
  );
}
