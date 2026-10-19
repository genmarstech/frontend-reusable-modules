import type { ThemeConfig } from "@/lib/themes/types";

/**
 * `hero.style === "none"` (the default theme) renders nothing at all — the
 * storefront home page looked exactly like this before theming existed,
 * and a plain general-purpose store gains nothing from a banner it never
 * asked for. Three other styles, one per themed vertical in the registry;
 * a fifth theme added later either reuses one of these or earns its own
 * branch here, the same way ProductCard's cardStyle works.
 */
export function ThemedHero({ themeConfig, storeName }: { themeConfig: ThemeConfig; storeName: string }) {
  const { hero, headingFontClassName, accentTextClassName, accentBgClassName } = themeConfig;

  if (hero.style === "none") return null;

  if (hero.style === "lookbook") {
    return (
      <div className="border-b border-neutral-200 pb-8 text-center">
        <p className={`text-3xl ${headingFontClassName} ${accentTextClassName}`}>{storeName}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{hero.tagline}</p>
      </div>
    );
  }

  if (hero.style === "techSpec") {
    return (
      <div className={`flex items-center justify-between rounded-lg px-5 py-4 text-white ${accentBgClassName}`}>
        <p className="text-sm font-medium">{hero.tagline}</p>
        <span className="font-mono text-xs opacity-80">{storeName}</span>
      </div>
    );
  }

  // "freshGrid"
  return (
    <div className={`rounded-2xl px-5 py-6 text-white ${accentBgClassName}`}>
      <p className="text-lg font-semibold">{storeName}</p>
      <p className="mt-1 text-sm opacity-90">{hero.tagline}</p>
    </div>
  );
}
