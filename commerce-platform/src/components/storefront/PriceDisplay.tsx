import type { ReactNode } from "react";

import { formatMoneyParts } from "@/lib/format";

const SIZES = {
  lg: { whole: "text-2xl", fraction: "text-sm" },
  xl: { whole: "text-3xl", fraction: "text-base" },
} as const;

/**
 * The large, raised-cents price treatment product pages use everywhere
 * this storefront sells something (Amazon's own product pages are the
 * reference point) — big whole-amount digits, the fraction riding small
 * and high. Product GRID cards (ProductCard.tsx) deliberately keep the
 * plain `formatMoney()` string instead; that treatment fighting a grid's
 * own card-to-card rhythm is a worse trade there than it is here, where
 * the price is the one number on the page.
 *
 * Renders only the whole amount, no superscript, when the currency has no
 * fraction at all (JPY) or none is known yet — see formatMoneyParts.
 */
export function PriceDisplay({
  amount,
  currency,
  size = "xl",
  accentClassName = "text-neutral-900",
  prefix,
}: {
  amount: string;
  currency?: string | null;
  size?: keyof typeof SIZES;
  accentClassName?: string;
  prefix?: ReactNode;
}) {
  const { whole, fraction } = formatMoneyParts(amount, currency);
  const { whole: wholeSize, fraction: fractionSize } = SIZES[size];

  return (
    <p className={`font-semibold ${accentClassName}`}>
      {prefix && <span className="mr-1 text-sm font-normal text-neutral-500">{prefix}</span>}
      <span className={wholeSize}>{whole}</span>
      {fraction && <sup className={`ml-0.5 font-semibold ${fractionSize}`}>{fraction}</sup>}
    </p>
  );
}
