import type { OrderStatusHistoryEntry } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/lib/types";

export function OrderTimeline({ history }: { history: OrderStatusHistoryEntry[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {history.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3">
          <div className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={entry.to_status as OrderStatus} />
              <span className="text-xs text-text-muted">{formatDate(entry.created_at)}</span>
            </div>
            {entry.note && <p className="mt-1 text-sm text-text-muted">{entry.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
