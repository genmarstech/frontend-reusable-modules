import type { Product } from "@/lib/api/types";
import { deleteProductImageAction } from "./actions";
import { ProductImageUpload } from "./ProductImageUpload";

/**
 * Deliberately NOT a Client Component — the thumbnails and their delete
 * buttons are plain server-rendered forms with a bound action, same
 * convention as members/page.tsx's suspend/remove buttons. Only the
 * upload control needs its own pending/error state, so that one piece
 * (ProductImageUpload) is the only Client Component in this tree.
 */
export function ProductImageManager({ storeSlug, product }: { storeSlug: string; product: Product }) {
  return (
    <div className="mt-3 space-y-2">
      {product.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.images.map((image) => (
            <div
              key={image.id}
              className="group relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200"
            >
              {/* Plain <img>, not next/image — an arbitrary backend-hosted
                 upload (MEDIA_URL), not an asset this app's own domain
                 config covers. */}
              <img src={image.image} alt="" className="h-full w-full object-cover" />
              <form
                action={deleteProductImageAction.bind(null, storeSlug, image.id)}
                className="absolute right-0 top-0"
              >
                <button
                  type="submit"
                  className="bg-black/60 px-1 text-xs leading-none text-white opacity-0 group-hover:opacity-100"
                  aria-label={`Remove this image from ${product.name}`}
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      <ProductImageUpload storeSlug={storeSlug} productId={product.id} />
    </div>
  );
}
