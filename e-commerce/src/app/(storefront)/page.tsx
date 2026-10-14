import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { djangoFetch, toQuery } from "@/lib/django";
import type { Category, Paginated, Product } from "@/lib/types";
import { ProductGrid } from "@/components/storefront/ProductGrid";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    djangoFetch<Paginated<Product>>(`/api/products/${toQuery({ ordering: "-created_at", page_size: 8 })}`, {
      anonymous: true,
      next: { revalidate: 60 },
    }),
    djangoFetch<Paginated<Category>>("/api/categories/", { anonymous: true, next: { revalidate: 300 } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-medium text-accent">/ Shop</p>
          <h1 className="mt-2 max-w-xl text-5xl font-semibold tracking-tight text-text sm:text-6xl">
            Good things, plainly sold.
          </h1>
          <p className="mt-4 max-w-md text-base text-text-muted">
            A small, honest catalog. Server-priced, always in stock when it says so.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-inverse px-6 py-3 text-sm font-medium text-inverse-text hover:opacity-85"
          >
            Browse the shop
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {categories.results.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {categories.results.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text hover:border-ink"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">New in</h2>
          <Link href="/shop" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid products={products.results} />
      </section>
    </div>
  );
}
