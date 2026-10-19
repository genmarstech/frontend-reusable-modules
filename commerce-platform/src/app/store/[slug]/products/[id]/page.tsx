import { notFound } from "next/navigation";

import { getProduct, listCategories } from "@/lib/api/catalog";
import { ApiError, NetworkError } from "@/lib/api/client";
import { getStoreInfo } from "@/lib/api/store";
import { getThemeConfig } from "@/lib/themes/registry";
import { resolveStoreTheme } from "@/lib/themes/types";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductBuyBox } from "@/components/storefront/ProductBuyBox";
import { ErrorState } from "@/components/ui/States";

/**
 * Routed by numeric id, not slug — two different businesses' products can
 * carry the identical auto-generated slug (confirmed live, see
 * docs/API_CONTRACT.md), so a slug-keyed route here would be ambiguous in
 * exactly the cross-tenant way this whole project is built to avoid.
 *
 * `instant = false` — same reason as the layout and the grid page: a
 * product-not-found here must become a real HTTP 404, which Cache
 * Components mode can't guarantee once a static shell's headers have
 * already gone out (confirmed live, see layout.tsx's own comment).
 */
export const instant = false;
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  let product: Awaited<ReturnType<typeof getProduct>>;
  let categoryName: string | null = null;
  let storeInfo: Awaited<ReturnType<typeof getStoreInfo>>;
  try {
    [product, storeInfo] = await Promise.all([getProduct(slug, id), getStoreInfo(slug)]);
    if (product.category !== null) {
      // `category` on a product is a bare id — the only way to turn it
      // into a name is this separate, already-anonymous-readable list.
      const categories = await listCategories(slug);
      categoryName = categories.results.find((c) => c.id === product.category)?.name ?? null;
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      // A product that belongs to a *different* business than `slug`
      // 404s identically to one that doesn't exist at all — the backend
      // scopes products/{id}/ to the resolved business, not to the id
      // alone (confirmed live), so this route can't be used to probe
      // another business's product ids.
      notFound();
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the store" detail={error.message} />;
    }
    throw error;
  }

  const themeConfig = getThemeConfig(resolveStoreTheme(storeInfo.theme));

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <ProductGallery images={product.images} alt={product.name} themeConfig={themeConfig} />

      <div className="space-y-4">
        {categoryName && (
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{categoryName}</p>
        )}
        <h1 className={`text-2xl font-semibold text-neutral-900 ${themeConfig.headingFontClassName}`}>
          {product.name}
        </h1>

        <ProductBuyBox storeSlug={slug} product={product} currency={storeInfo.currency} themeConfig={themeConfig} />

        {product.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.description}</p>
        )}
      </div>
    </div>
  );
}
