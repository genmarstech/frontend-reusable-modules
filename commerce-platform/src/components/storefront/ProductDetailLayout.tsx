import type { Product } from "@/lib/api/types";
import type { ThemeConfig } from "@/lib/themes/types";
import { ProductGallery } from "./ProductGallery";
import { ProductBuyBox } from "./ProductBuyBox";
import { groupByName } from "./VariantPicker";

/**
 * `themeConfig.detailLayout` picks the branch below — the same dispatch
 * convention as ProductCard's cardStyle and ThemedHero's hero.style. Every
 * branch composes the same real fields (sku, category, variants, price,
 * description, images); none invents data the backend doesn't return. The
 * "standard" branch is the page's original composition, unchanged, so a
 * store that has never touched its theme setting sees no visual change.
 */
export function ProductDetailLayout({
  storeSlug,
  product,
  categoryName,
  currency,
  themeConfig,
}: {
  storeSlug: string;
  product: Product;
  categoryName: string | null;
  currency?: string;
  themeConfig: ThemeConfig;
}) {
  const category = categoryName && (
    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{categoryName}</p>
  );
  const description = product.description && (
    <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">{product.description}</p>
  );

  if (themeConfig.detailLayout === "lookbook") {
    // Fashion reads top-to-bottom like a lookbook spread: the gallery takes
    // the larger share of the row, and the copy runs before the buy box
    // rather than after it — a browsing decision, not a spec lookup.
    return (
      <div className="grid gap-10 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <ProductGallery images={product.images} alt={product.name} themeConfig={themeConfig} />
        </div>
        <div className="space-y-5 sm:col-span-2 sm:self-center">
          {categoryName && (
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{categoryName}</p>
          )}
          <h1 className={`text-3xl leading-tight text-neutral-900 ${themeConfig.headingFontClassName}`}>
            {product.name}
          </h1>
          {product.description && (
            <p className="whitespace-pre-line text-base leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}
          <div className="pt-2">
            <ProductBuyBox storeSlug={storeSlug} product={product} currency={currency} themeConfig={themeConfig} />
          </div>
        </div>
      </div>
    );
  }

  if (themeConfig.detailLayout === "specSheet") {
    // Electronics shoppers compare before they browse — SKU, category and
    // every variant dimension the business actually entered (e.g. Colour,
    // Storage) sit in one table ABOVE the buy box, in the spec-table shape
    // Amazon's electronics listings use. Each row only ever holds a value
    // this product really has; a product with no variants just shows SKU
    // and category, never a fabricated spec.
    const specRows = groupByName(product.variants).map(
      ([name, variants]) => [name, Array.from(new Set(variants.map((variant) => variant.value)))] as const
    );

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} themeConfig={themeConfig} />
        <div className="space-y-4">
          {category}
          <h1 className={`text-xl font-semibold text-neutral-900 ${themeConfig.headingFontClassName}`}>
            {product.name}
          </h1>

          <dl className="divide-y divide-neutral-200 rounded-md border border-neutral-200 text-sm">
            <div className="flex justify-between gap-4 px-3 py-2">
              <dt className="text-neutral-500">SKU</dt>
              <dd className="font-mono text-neutral-900">{product.sku}</dd>
            </div>
            {categoryName && (
              <div className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-neutral-500">Category</dt>
                <dd className="text-neutral-900">{categoryName}</dd>
              </div>
            )}
            {specRows.map(([name, values]) => (
              <div key={name} className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-neutral-500">{name}</dt>
                <dd className="text-neutral-900">{values.join(" · ")}</dd>
              </div>
            ))}
          </dl>

          <ProductBuyBox storeSlug={storeSlug} product={product} currency={currency} themeConfig={themeConfig} />
          {description}
        </div>
      </div>
    );
  }

  if (themeConfig.detailLayout === "quickBuy") {
    // Grocery shoppers are restocking, not browsing — the add-to-cart
    // control sits directly under the name, in its own card, before the
    // description, so the one action most visits are for needs no scroll.
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} themeConfig={themeConfig} />
        <div className="space-y-4">
          {category}
          <h1 className={`text-2xl font-semibold text-neutral-900 ${themeConfig.headingFontClassName}`}>
            {product.name}
          </h1>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <ProductBuyBox storeSlug={storeSlug} product={product} currency={currency} themeConfig={themeConfig} />
          </div>
          {description}
        </div>
      </div>
    );
  }

  // "standard" — the original, unthemed composition.
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <ProductGallery images={product.images} alt={product.name} themeConfig={themeConfig} />
      <div className="space-y-4">
        {category}
        <h1 className={`text-2xl font-semibold text-neutral-900 ${themeConfig.headingFontClassName}`}>
          {product.name}
        </h1>
        <ProductBuyBox storeSlug={storeSlug} product={product} currency={currency} themeConfig={themeConfig} />
        {description}
      </div>
    </div>
  );
}
