import Link from "next/link";
import { Plus } from "lucide-react";
import { djangoFetch, toQuery } from "@/lib/django";
import type { Category, Paginated, Product } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProductStatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { formatMoney } from "@/lib/format";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [products, categories] = await Promise.all([
    djangoFetch<Paginated<Product>>(`/api/products/${toQuery({ search: params.search, page })}`, { cache: "no-store" }),
    djangoFetch<Paginated<Category>>("/api/categories/", { next: { revalidate: 300 } }),
  ]);
  const categoryName = new Map(categories.results.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="size-4" /> New product
          </Button>
        </Link>
      </div>

      <form action="/admin/products" method="get" className="max-w-xs">
        <Input id="search" name="search" placeholder="Search by name or SKU…" defaultValue={params.search} />
      </form>

      <Card>
        {products.results.length === 0 ? (
          <EmptyState title="No products yet" description="Create your first product to get started." className="border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.results.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-text hover:text-accent">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{product.sku}</td>
                    <td className="px-5 py-3 text-text-muted">{product.category ? categoryName.get(product.category) : "—"}</td>
                    <td className="px-5 py-3 text-text">{formatMoney(product.price)}</td>
                    <td className="px-5 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} pageSize={PAGE_SIZE} count={products.count} basePath={`/admin/products${toQuery({ search: params.search })}`} />
    </div>
  );
}
