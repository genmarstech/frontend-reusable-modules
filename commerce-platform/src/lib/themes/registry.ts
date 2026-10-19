import type { StoreTheme, ThemeConfig } from "./types";

/**
 * One entry per StoreTheme. Every component that renders differently per
 * theme (ProductGrid/ProductCard, ThemedHero, the store layout's header
 * accent) reads its tokens from here — never a theme-keyed `if` of its own
 * — so a new theme is additive, not a hunt through every component file.
 */
export const THEME_REGISTRY: Record<StoreTheme, ThemeConfig> = {
  default: {
    key: "default",
    label: "Default",
    description: "A clean, general-purpose grid — the right choice when nothing more specific fits yet.",
    headingFontClassName: "",
    accentTextClassName: "text-neutral-900",
    accentBgClassName: "bg-neutral-900",
    accentRingClassName: "focus:ring-neutral-500",
    productGrid: {
      columnsClassName: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      gapClassName: "gap-4",
      cardStyle: "grid",
      imageAspectClassName: "aspect-square",
    },
    hero: { style: "none", tagline: "" },
  },

  fashion: {
    key: "fashion",
    label: "Fashion",
    description: "Editorial and lookbook-style — fewer, larger products per row, generous whitespace.",
    headingFontClassName: "font-serif",
    accentTextClassName: "text-stone-900",
    accentBgClassName: "bg-stone-900",
    accentRingClassName: "focus:ring-stone-500",
    productGrid: {
      columnsClassName: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gapClassName: "gap-x-6 gap-y-10",
      cardStyle: "editorial",
      imageAspectClassName: "aspect-[3/4]",
    },
    hero: { style: "lookbook", tagline: "New arrivals, curated for the season." },
  },

  electronics: {
    key: "electronics",
    label: "Electronics",
    description: "Spec-forward and dense — more products per row, SKU and price always visible.",
    headingFontClassName: "",
    accentTextClassName: "text-blue-700",
    accentBgClassName: "bg-blue-700",
    accentRingClassName: "focus:ring-blue-500",
    productGrid: {
      columnsClassName: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
      gapClassName: "gap-3",
      cardStyle: "compact",
      imageAspectClassName: "aspect-square",
    },
    hero: { style: "techSpec", tagline: "Compare specs, prices and stock at a glance." },
  },

  grocery: {
    key: "grocery",
    label: "Fresh / Grocery",
    description: "Vibrant and quick — rounded cards with add-to-cart right on the grid, no detour required.",
    headingFontClassName: "",
    accentTextClassName: "text-green-700",
    accentBgClassName: "bg-green-600",
    accentRingClassName: "focus:ring-green-500",
    productGrid: {
      columnsClassName: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      gapClassName: "gap-4",
      cardStyle: "vibrant",
      imageAspectClassName: "aspect-[4/3]",
    },
    hero: { style: "freshGrid", tagline: "Today's picks, fresh in stock." },
  },
};

export function getThemeConfig(theme: StoreTheme): ThemeConfig {
  return THEME_REGISTRY[theme];
}
