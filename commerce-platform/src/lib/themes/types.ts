/**
 * The frontend half of core/models.py::StoreSettings.Theme. A theme is a
 * design PATTERN, not a palette swap — grid density, card layout, hero
 * treatment and typography all change together, picked by the business at
 * onboarding (or any time after, via the dashboard Settings page) and read
 * back from the one public field GET /api/<slug>/store/ exposes.
 *
 * Adding a fifth theme later is: one more entry in STORE_THEMES, one more
 * key in registry.ts's THEME_REGISTRY, and — if the existing layout
 * vocabulary (cardStyle/hero.style below) doesn't already cover it — one
 * more branch in ProductCard/ThemedHero. Nothing elsewhere has to change,
 * which is the actual point of having a registry instead of `if (theme ===
 * ...)` scattered across every storefront component.
 */
export const STORE_THEMES = ["default", "fashion", "electronics", "grocery"] as const;

export type StoreTheme = (typeof STORE_THEMES)[number];

export function isStoreTheme(value: string): value is StoreTheme {
  return (STORE_THEMES as readonly string[]).includes(value);
}

/**
 * Never trust a raw string from the backend as a StoreTheme without going
 * through this first. core/models.py's own Theme enum is the source of
 * truth and can grow ahead of this frontend being redeployed (see the
 * backend's own comment on that enum) — an unrecognized value here must
 * degrade to the default layout, not crash the storefront a customer is
 * trying to buy something from.
 */
export function resolveStoreTheme(value: string | undefined | null): StoreTheme {
  if (value && isStoreTheme(value)) return value;
  return "default";
}

export type ProductCardStyle = "grid" | "editorial" | "compact" | "vibrant";
export type HeroStyle = "none" | "lookbook" | "techSpec" | "freshGrid";
/**
 * Picks the branch in ProductDetailLayout, the same way cardStyle picks the
 * branch in ProductCard — "standard" renders the page's original, unthemed
 * composition byte-for-byte, so a store that has never touched its theme
 * setting sees no change. The other three rearrange and emphasize the same
 * real fields (sku, category, variants, description) differently per
 * vertical; none of them invent data the backend doesn't return.
 */
export type DetailLayoutStyle = "standard" | "lookbook" | "specSheet" | "quickBuy";

export interface ThemeConfig {
  key: StoreTheme;
  label: string;
  description: string;
  /** Tailwind class applied to storefront heading-level text. Empty string
   * means "inherit the app's default sans stack" — only Fashion loads an
   * extra font today; see store/[slug]/layout.tsx. */
  headingFontClassName: string;
  /** Accent color applied to in-stock/price/CTA affordances. */
  accentTextClassName: string;
  accentBgClassName: string;
  accentRingClassName: string;
  productGrid: {
    columnsClassName: string;
    gapClassName: string;
    cardStyle: ProductCardStyle;
    imageAspectClassName: string;
  };
  hero: {
    style: HeroStyle;
    tagline: string;
  };
  detailLayout: DetailLayoutStyle;
}
