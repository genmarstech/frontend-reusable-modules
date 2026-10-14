import clsx from "clsx";
import { illustrationFor, type IllustrationTone } from "@/lib/category-illustrations";

const TONE_CLASSES: Record<IllustrationTone, { bg: string; icon: string; blob: string }> = {
  violet: { bg: "bg-stat-violet-bg", icon: "text-stat-violet-ink", blob: "bg-stat-violet-ink" },
  green: { bg: "bg-stat-green-bg", icon: "text-stat-green-ink", blob: "bg-stat-green-ink" },
  amber: { bg: "bg-stat-amber-bg", icon: "text-stat-amber-ink", blob: "bg-stat-amber-ink" },
  blue: { bg: "bg-stat-blue-bg", icon: "text-stat-blue-ink", blob: "bg-stat-blue-ink" },
  rose: { bg: "bg-stat-rose-bg", icon: "text-stat-rose-ink", blob: "bg-stat-rose-ink" },
  gray: { bg: "bg-stat-gray-bg", icon: "text-stat-gray-ink", blob: "bg-stat-gray-ink" },
};

/**
 * Stands in for a product photo — this demo catalog has no real photography
 * behind it (see catalog/management/commands/seed_catalog.py), so every
 * product shows a deliberate, on-brand illustration instead of a broken
 * image or a flat "no photo" glyph. Picked by category via
 * lib/category-illustrations.ts; a real photo on the product (once one
 * exists) always takes priority — see ProductCard/ProductDetailActions.
 */
export function CategoryIllustration({
  categoryName,
  className,
  iconClassName,
}: {
  categoryName?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  const { icon: Icon, tone } = illustrationFor(categoryName);
  const palette = TONE_CLASSES[tone];

  return (
    <div className={clsx("relative flex items-center justify-center overflow-hidden", palette.bg, className)}>
      <div aria-hidden className={clsx("absolute -right-6 -top-10 size-28 rounded-full opacity-20 blur-2xl", palette.blob)} />
      <div aria-hidden className={clsx("absolute -bottom-10 -left-8 size-32 rounded-full opacity-15 blur-2xl", palette.blob)} />
      <Icon className={clsx("relative size-1/3 opacity-90", palette.icon, iconClassName)} strokeWidth={1.25} />
    </div>
  );
}
