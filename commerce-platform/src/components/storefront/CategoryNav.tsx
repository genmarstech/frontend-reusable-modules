import Link from "next/link";
import type { Category } from "@/lib/api/types";

/**
 * `category` on a Product is a bare id with no public lookup-by-id
 * endpoint of its own — this list of {id, name} pairs from `/categories/`
 * is what makes both the filter pills below and a product detail page's
 * category label possible at all.
 */
export function CategoryNav({
  categories,
  storeSlug,
  activeCategoryId,
}: {
  categories: Category[];
  storeSlug: string;
  activeCategoryId?: number;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Categories" className="flex flex-wrap gap-2">
      <Link
        href={`/store/${storeSlug}`}
        className={`rounded-full border px-3 py-1 text-sm ${
          activeCategoryId === undefined
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/store/${storeSlug}?category=${category.id}`}
          className={`rounded-full border px-3 py-1 text-sm ${
            activeCategoryId === category.id
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
