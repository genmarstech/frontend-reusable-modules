import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox } from "lucide-react";
import clsx from "clsx";
import { IconIllustration, type IllustrationTone } from "./IconIllustration";

export function EmptyState({
  icon: Icon = Inbox,
  tone = "gray",
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  tone?: IllustrationTone;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center", className)}>
      <IconIllustration icon={Icon} tone={tone} />
      <div>
        <p className="font-medium text-text">{title}</p>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-danger/20 bg-stat-rose-bg/40 py-16 text-center">
      <IconIllustration icon={AlertTriangle} tone="rose" />
      <div>
        <p className="font-medium text-text">{title}</p>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-bg-sunken", className)} />;
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
