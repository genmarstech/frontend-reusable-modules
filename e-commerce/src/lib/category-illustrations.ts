import {
  BookOpen,
  Dumbbell,
  Headphones,
  type LucideIcon,
  Package,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

export type IllustrationTone = "violet" | "green" | "amber" | "blue" | "rose" | "gray";

export interface IllustrationSpec {
  icon: LucideIcon;
  tone: IllustrationTone;
}

// Keyed by catalog.Category.name (backend's seed data — see
// catalog/management/commands/seed_catalog.py). No real product
// photography exists for this demo catalog, so every product shows one of
// these instead of a broken image: an on-brand illustration, never a blank
// box with a "missing image" glyph.
const BY_CATEGORY: Record<string, IllustrationSpec> = {
  Electronics: { icon: Headphones, tone: "violet" },
  "Home & Kitchen": { icon: UtensilsCrossed, tone: "amber" },
  Fashion: { icon: Shirt, tone: "blue" },
  "Beauty & Personal Care": { icon: Sparkles, tone: "rose" },
  "Sports & Outdoors": { icon: Dumbbell, tone: "green" },
  "Books & Stationery": { icon: BookOpen, tone: "gray" },
};

const DEFAULT_SPEC: IllustrationSpec = { icon: Package, tone: "gray" };

export function illustrationFor(categoryName?: string | null): IllustrationSpec {
  if (!categoryName) return DEFAULT_SPEC;
  return BY_CATEGORY[categoryName] ?? DEFAULT_SPEC;
}
