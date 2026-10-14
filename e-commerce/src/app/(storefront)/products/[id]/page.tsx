import Image from "next/image";
import { notFound } from "next/navigation";
import { ImageOff } from "lucide-react";
import { djangoFetch, ApiRequestError } from "@/lib/django";
import type { Product } from "@/lib/types";
import { ProductDetailActions } from "@/components/storefront/ProductDetailActions";

async function getProduct(id: string): Promise<Product> {
  try {
    return await djangoFetch<Product>(`/api/products/${id}/`, { anonymous: true, next: { revalidate: 30 } });
  } catch (error) {
    if (error instanceof ApiRequestError && error.isNotFound) notFound();
    throw error;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const cover = product.images[0];
  const outOfStock = product.status !== "published";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-sunken">
          {cover ? (
            <Image src={cover.image} alt={product.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <ImageOff className="size-12" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-text-muted">{product.sku}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">{product.name}</h1>
          </div>

          <ProductDetailActions
            productId={product.id}
            basePrice={product.price}
            variants={product.variants}
            outOfStock={outOfStock}
          />

          {product.description && (
            <div className="border-t border-border pt-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
