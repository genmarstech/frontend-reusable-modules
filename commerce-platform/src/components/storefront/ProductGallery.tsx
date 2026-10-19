"use client";

import { useState } from "react";

import type { ProductImage as ProductImageData } from "@/lib/api/types";
import type { ThemeConfig } from "@/lib/themes/types";
import { ProductImage } from "./ProductImage";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

/**
 * Main image + thumbnail strip — before this, the product detail page
 * only ever rendered `images[0]`; every other uploaded image existed in
 * the API response and was silently discarded. The strip is skipped
 * entirely for 0 or 1 images; with nothing to switch between it would
 * only be clutter.
 *
 * The selected-thumbnail border is a plain neutral, not a theme accent —
 * Tailwind's class scanner needs the full class name as a literal in
 * source, so building one (e.g. turning `accentRingClassName`'s
 * "focus:ring-x" into "border-x" at runtime) would silently produce no
 * style at all. Per-theme gallery treatment is a separate, later pass.
 */
export function ProductGallery({
  images,
  alt,
  themeConfig,
}: {
  images: ProductImageData[];
  alt: string;
  themeConfig: ThemeConfig;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div className="space-y-3">
      <div className={`overflow-hidden rounded-lg bg-neutral-100 ${themeConfig.productGrid.imageAspectClassName}`}>
        {current ? (
          <ProductImage src={current.image} alt={alt} className="h-full w-full" />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={index === selected}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                index === selected ? "border-neutral-900" : "border-transparent hover:border-neutral-300"
              }`}
            >
              <ProductImage src={image.image} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
