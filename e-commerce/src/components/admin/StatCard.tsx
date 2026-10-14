import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Tone = "green" | "amber" | "blue" | "rose" | "violet" | "gray";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-stat-green-bg text-stat-green-ink",
  amber: "bg-stat-amber-bg text-stat-amber-ink",
  blue: "bg-stat-blue-bg text-stat-blue-ink",
  rose: "bg-stat-rose-bg text-stat-rose-ink",
  violet: "bg-stat-violet-bg text-stat-violet-ink",
  gray: "bg-stat-gray-bg text-stat-gray-ink",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "gray",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  return (
    <div className={clsx("rounded-2xl p-5", TONE_CLASSES[tone])}>
      <div className="flex items-center justify-between">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-sm opacity-80">{label}</p>
    </div>
  );
}
