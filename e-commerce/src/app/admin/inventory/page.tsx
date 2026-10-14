import { djangoFetch, toQuery } from "@/lib/django";
import type { InventoryRecord, Paginated, Product, ProductVariant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { InventoryTable, type InventoryRow } from "@/components/admin/InventoryTable";

const PAGE_SIZE = 20;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [inventory, products, variants] = await Promise.all([
    djangoFetch<Paginated<InventoryRecord>>(`/api/inventory/${toQuery({ search: params.search, page })}`, { cache: "no-store" }),
    djangoFetch<Paginated<Product>>(`/api/products/${toQuery({ page_size: 200 })}`, { cache: "no-store" }),
    djangoFetch<Paginated<ProductVariant>>(`/api/product-variants/${toQuery({ page_size: 500 })}`, { cache: "no-store" }),
  ]);

  const productById = new Map(products.results.map((p) => [p.id, p]));
  const variantById = new Map(variants.results.map((v) => [v.id, v]));

  const rows: InventoryRow[] = inventory.results.map((record) => {
    if (record.variant) {
      const variant = variantById.get(record.variant);
      return { record, label: variant ? `${variant.name}: ${variant.value}` : `Variant #${record.variant}`, sku: variant?.sku ?? "" };
    }
    const product = record.product ? productById.get(record.product) : undefined;
    return { record, label: product?.name ?? `Product #${record.product}`, sku: product?.sku ?? "" };
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Inventory</h1>

      <form action="/admin/inventory" method="get" className="max-w-xs">
        <Input id="search" name="search" placeholder="Search by product name or SKU…" defaultValue={params.search} />
      </form>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No inventory records" description="Create a product, then add a stock record for it." className="border-0" />
        ) : (
          <InventoryTable rows={rows} />
        )}
      </Card>

      <Pagination page={page} pageSize={PAGE_SIZE} count={inventory.count} basePath={`/admin/inventory${toQuery({ search: params.search })}`} />
    </div>
  );
}
