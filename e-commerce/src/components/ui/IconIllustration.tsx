import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export type IllustrationTone = "violet" | "green" | "amber" | "blue" | "rose" | "gray";

const TONE_CLASSES: Record<IllustrationTone, string> = {
  violet: "bg-stat-violet-bg text-stat-violet-ink",
  green: "bg-stat-green-bg text-stat-green-ink",
  amber: "bg-stat-amber-bg text-stat-amber-ink",
  blue: "bg-stat-blue-bg text-stat-blue-ink",
  rose: "bg-stat-rose-bg text-stat-rose-ink",
  gray: "bg-stat-gray-bg text-stat-gray-ink",
};

/** A round, colored icon badge — the shared building block behind empty
 * states and the per-category product illustrations, so both read as the
 * same illustration system rather than two unrelated styles. */
export function IconIllustration({
  icon: Icon,
  tone = "gray",
  className,
}: {
  icon: LucideIcon;
  tone?: IllustrationTone;
  className?: string;
}) {
  return (
    <div className={clsx("flex size-16 items-center justify-center rounded-full", TONE_CLASSES[tone], className)}>
      <Icon className="size-7" strokeWidth={1.5} />
    </div>
  );
}
