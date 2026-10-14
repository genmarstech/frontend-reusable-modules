import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { CategoryIllustration } from "./illustrations/CategoryIllustration";

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const cover = product.images[0];
  const outOfStock = product.status !== "published";

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-bg-sunken"
      >
        {cover ? (
          <Image
            src={cover.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <CategoryIllustration
            categoryName={categoryName}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/products/${product.id}`} className="block truncate text-sm font-medium text-text">
            {product.name}
          </Link>
          <p className="text-sm text-text-muted">{formatMoney(product.price)}</p>
        </div>
        <AddToCartButton productId={product.id} disabled={outOfStock} />
      </div>
    </div>
  );
}
