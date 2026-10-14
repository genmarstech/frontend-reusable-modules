import Link from "next/link";
import clsx from "clsx";
import { djangoFetch, toQuery } from "@/lib/django";
import type { Category, Paginated, Product } from "@/lib/types";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

const PAGE_SIZE = 20;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [products, categories] = await Promise.all([
    djangoFetch<Paginated<Product>>(
      `/api/products/${toQuery({
        category: params.category,
        search: params.search,
        page,
        ordering: "-created_at",
      })}`,
      { anonymous: true, next: { revalidate: 30 } },
    ),
    djangoFetch<Paginated<Category>>("/api/categories/", { anonymous: true, next: { revalidate: 300 } }),
  ]);

  const basePath = `/shop${toQuery({ category: params.category, search: params.search })}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">/ Shop</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-text">
            {params.category ? categories.results.find((c) => String(c.id) === params.category)?.name : "All products"}
          </h1>
        </div>
        <form action="/shop" method="get" className="w-full sm:w-64">
          {params.category && <input type="hidden" name="category" value={params.category} />}
          <Input id="search" name="search" placeholder="Search products…" defaultValue={params.search} />
        </form>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        <aside className="shrink-0 sm:w-48">
          <nav className="flex gap-2 overflow-x-auto pb-2 sm:flex-col sm:overflow-visible sm:pb-0">
            <Link
              href="/shop"
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm sm:rounded-none sm:px-0 sm:py-1",
                !params.category ? "bg-inverse text-inverse-text sm:bg-transparent sm:font-semibold sm:text-text" : "text-text-muted hover:text-text",
              )}
            >
              All
            </Link>
            {categories.results.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.id}`}
                className={clsx(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm sm:rounded-none sm:px-0 sm:py-1",
                  params.category === String(category.id)
                    ? "bg-inverse text-inverse-text sm:bg-transparent sm:font-semibold sm:text-text"
                    : "text-text-muted hover:text-text",
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <ProductGrid products={products.results} />
          <Pagination page={page} pageSize={PAGE_SIZE} count={products.count} basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
