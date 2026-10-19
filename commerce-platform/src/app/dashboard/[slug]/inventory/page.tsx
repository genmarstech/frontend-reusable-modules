import { ApiError, NetworkError } from "@/lib/api/client";
import { listInventory } from "@/lib/api/inventory";
import { listCategories, listProducts } from "@/lib/api/catalog";
import { getAccessToken } from "@/lib/auth/session";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { AdjustStockForm } from "./AdjustStockForm";
import { NewProductForm } from "./NewProductForm";
import { updateThresholdAction } from "./actions";

export const instant = false;
export default async function OpsInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const accessToken = (await getAccessToken())!;

  let records;
  let products;
  let categories;
  try {
    [records, products, categories] = await Promise.all([
      listInventory(accessToken, slug, q),
      listProducts(slug, undefined, accessToken),
      listCategories(slug),
    ]);
  } catch (error) {
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  // Names for display only — the record itself is always keyed by id.
  // Covers this business's first page of products (PAGE_SIZE=20, no
  // override — docs/API_CONTRACT.md's documented pagination gap); a
  // product beyond that page falls back to showing its bare id below.
  const productNames = new Map<number, string>();
  const variantNames = new Map<number, string>();
  for (const product of products.results) {
    productNames.set(product.id, product.name);
    for (const variant of product.variants) {
      variantNames.set(variant.id, `${product.name} (${variant.value})`);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Inventory</h2>

      <NewProductForm storeSlug={slug} categories={categories.results} />

      <form className="flex gap-2 text-sm" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search product name, sku…"
          className="rounded-md border border-neutral-300 px-3 py-1.5"
        />
        <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white">
          Search
        </button>
      </form>

      {records.results.length === 0 ? (
        <EmptyState title="No inventory records match" />
      ) : (
        <div className="space-y-3">
          {records.results.map((record) => {
            const name = record.variant
              ? variantNames.get(record.variant) ?? `Variant #${record.variant}`
              : productNames.get(record.product) ?? `Product #${record.product}`;
            return (
              <div
                key={record.id}
                className={`rounded-lg border bg-white p-4 ${
                  record.is_low_stock ? "border-amber-300" : "border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-neutral-500">
                      {record.quantity} in stock
                      {record.is_low_stock && <span className="ml-2 text-amber-700">Low stock</span>}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <AdjustStockForm storeSlug={slug} recordId={record.id} />
                </div>
                <form
                  action={updateThresholdAction.bind(null, slug, record.id)}
                  className="mt-2 flex items-center gap-2 text-xs text-neutral-500"
                >
                  <label htmlFor={`threshold-${record.id}`}>Low stock threshold</label>
                  <input
                    id={`threshold-${record.id}`}
                    name="low_stock_threshold"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={record.low_stock_threshold ?? ""}
                    placeholder="business default"
                    className="w-24 rounded-md border border-neutral-300 px-2 py-1"
                  />
                  <button type="submit" className="rounded-md border border-neutral-300 px-2 py-1 font-medium">
                    Save
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-neutral-400">{records.count} total</p>
    </div>
  );
}
