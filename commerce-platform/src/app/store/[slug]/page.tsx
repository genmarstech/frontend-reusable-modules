import { listCategories, listProducts } from "@/lib/api/catalog";
import { ApiError, NetworkError } from "@/lib/api/client";
import { getStoreInfo } from "@/lib/api/store";
import { getThemeConfig } from "@/lib/themes/registry";
import { resolveStoreTheme } from "@/lib/themes/types";
import { CategoryNav } from "@/components/storefront/CategoryNav";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ThemedHero } from "@/components/storefront/ThemedHero";
import { EmptyState, ErrorState } from "@/components/ui/States";

/**
 * `?category=` is the one filter this phase exposes — `category` is a
 * documented, backend-supported query param on /products/ (catalog/
 * filters.py::ProductFilter), not an invented one. Pagination beyond the
 * first page (always 20 results, confirmed — see docs/API_CONTRACT.md) is
 * out of scope for this phase; a store with more than 20 published
 * products in one category sees only the first page, which is an honest
 * limitation to note in the final report, not a bug to silently paper
 * over here.
 *
 * `instant = false` — same reason as the layout above: this page's entire
 * content is a per-request catalog call, so Cache Components mode's
 * streamed-shell behavior would have no static content worth shipping
 * ahead of the request anyway, and would otherwise let an error response
 * ship with a 200 already sent.
 */
export const instant = false;
export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category } = await searchParams;
  const categoryId = category ? Number(category) : undefined;

  let data: {
    products: Awaited<ReturnType<typeof listProducts>>;
    categories: Awaited<ReturnType<typeof listCategories>>;
    storeInfo: Awaited<ReturnType<typeof getStoreInfo>>;
  };
  try {
    const [products, categories, storeInfo] = await Promise.all([
      listProducts(slug, categoryId !== undefined && Number.isFinite(categoryId) ? { category: String(categoryId) } : undefined),
      listCategories(slug),
      getStoreInfo(slug),
    ]);
    data = { products, categories, storeInfo };
  } catch (error) {
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the store" detail={error.message} />;
    }
    throw error;
  }

  const themeConfig = getThemeConfig(resolveStoreTheme(data.storeInfo.theme));

  return (
    <div className="space-y-6">
      <ThemedHero themeConfig={themeConfig} storeName={data.storeInfo.name} />

      <CategoryNav
        categories={data.categories.results}
        storeSlug={slug}
        activeCategoryId={categoryId !== undefined && Number.isFinite(categoryId) ? categoryId : undefined}
      />

      {data.products.results.length === 0 ? (
        <EmptyState
          title="No products here yet"
          description={categoryId !== undefined ? "Nothing in this category right now." : "This store hasn't listed any products yet."}
        />
      ) : (
        <ProductGrid
          products={data.products.results}
          storeSlug={slug}
          themeConfig={themeConfig}
          currency={data.storeInfo.currency}
          returnPath={category ? `/store/${slug}?category=${category}` : `/store/${slug}`}
        />
      )}
    </div>
  );
}
