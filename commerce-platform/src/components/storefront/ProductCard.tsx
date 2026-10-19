import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { THEME_REGISTRY } from "@/lib/themes/registry";
import type { ThemeConfig } from "@/lib/themes/types";
import { AddToCartForm } from "./AddToCartForm";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { ProductImage } from "./ProductImage";

/**
 * `images[0]` and `ProductImagePlaceholder` are mutually exclusive, not
 * layered — showing a placeholder *behind* a real `<img>` risks a flash of
 * the placeholder on every slow load, which reads as broken, not graceful.
 * A product that has an image record whose URL turns out to be
 * unreachable still ends up showing the placeholder, just one render
 * later, via ProductImage's own onError fallback.
 *
 * `themeConfig.productGrid.cardStyle` picks the layout branch below —
 * image, title and price are the one shared vocabulary every style reuses;
 * what differs is proportion, typography, and whether a quick-add control
 * sits on the card itself. The default `themeConfig` (THEME_REGISTRY's own
 * "default" entry, cardStyle "grid") renders byte-for-byte what this
 * component rendered before theming existed, so a store that has never
 * touched its theme setting sees no visual change at all.
 */
export function ProductCard({
  product,
  storeSlug,
  themeConfig = THEME_REGISTRY.default,
  currency,
  returnPath,
}: {
  product: Product;
  storeSlug: string;
  themeConfig?: ThemeConfig;
  currency?: string;
  returnPath?: string;
}) {
  const image = product.images[0];
  const hasVariants = product.variants.length > 0;
  const fromPrice = hasVariants
    ? Math.min(...product.variants.map((variant) => Number(variant.price_override ?? variant.price)))
    : null;
  const priceLabel =
    hasVariants && fromPrice !== null && fromPrice !== Number(product.price) ? (
      <>From {formatMoney(String(fromPrice), currency)}</>
    ) : (
      formatMoney(product.price, currency)
    );
  const { cardStyle, imageAspectClassName } = themeConfig.productGrid;

  const media = image ? (
    <ProductImage
      src={image.image}
      alt={product.name}
      className="h-full w-full transition group-hover:scale-[1.02]"
    />
  ) : (
    <ProductImagePlaceholder className="h-full w-full" />
  );

  if (cardStyle === "editorial") {
    return (
      <Link href={`/store/${storeSlug}/products/${product.id}`} className="group flex flex-col">
        <div className={`w-full overflow-hidden bg-neutral-100 ${imageAspectClassName}`}>{media}</div>
        <div className="mt-4 flex flex-col gap-1">
          <h3 className={`text-base text-neutral-900 ${themeConfig.headingFontClassName}`}>{product.name}</h3>
          <p className="text-sm text-neutral-500">{priceLabel}</p>
        </div>
      </Link>
    );
  }

  if (cardStyle === "compact") {
    return (
      <Link
        href={`/store/${storeSlug}/products/${product.id}`}
        className="group flex flex-col overflow-hidden rounded-md border border-neutral-200 bg-white transition hover:border-neutral-300"
      >
        <div className={`w-full overflow-hidden bg-neutral-100 ${imageAspectClassName}`}>{media}</div>
        <div className="flex flex-1 flex-col gap-0.5 p-2">
          <h3 className="line-clamp-2 text-xs font-medium text-neutral-900">{product.name}</h3>
          <p className="font-mono text-[10px] text-neutral-400">{product.sku}</p>
          <p className={`mt-auto text-sm font-semibold ${themeConfig.accentTextClassName}`}>{priceLabel}</p>
        </div>
      </Link>
    );
  }

  if (cardStyle === "vibrant") {
    return (
      <Link
        href={`/store/${storeSlug}/products/${product.id}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-md"
      >
        <div className={`w-full overflow-hidden bg-neutral-100 ${imageAspectClassName}`}>{media}</div>
        <div className="flex flex-1 items-end justify-between gap-2 p-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
            <p className={`text-sm font-semibold ${themeConfig.accentTextClassName}`}>{priceLabel}</p>
          </div>
          <AddToCartForm
            storeSlug={storeSlug}
            productId={product.id}
            compact
            returnPath={returnPath}
            accentClassName={`${themeConfig.accentBgClassName} hover:opacity-90`}
          />
        </div>
      </Link>
    );
  }

  // cardStyle === "grid" — the original, unthemed layout.
  return (
    <Link
      href={`/store/${storeSlug}/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className={`w-full overflow-hidden bg-neutral-100 ${imageAspectClassName}`}>{media}</div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
        <p className="mt-auto text-sm text-neutral-600">{priceLabel}</p>
      </div>
    </Link>
  );
}
