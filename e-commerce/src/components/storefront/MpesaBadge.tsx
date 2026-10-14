import { Smartphone } from "lucide-react";
import clsx from "clsx";

export function MpesaBadge({ className, label = "Pay with M-Pesa" }: { className?: string; label?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-mpesa-soft px-3 py-1 text-xs font-semibold text-mpesa-ink",
        className,
      )}
    >
      <Smartphone className="size-3.5" />
      {label}
    </span>
  );
}
