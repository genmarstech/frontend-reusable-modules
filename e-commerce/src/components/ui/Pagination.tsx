import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

/** Works off DRF's {count, next, previous} shape — this component just
 * needs to know the current page and total count; `next`/`previous` being
 * non-null strings from Django isn't needed since we rebuild the URL
 * ourselves (keeps it usable from both server links and client fetches). */
export function Pagination({
  page,
  pageSize,
  count,
  basePath,
}: {
  page: number;
  pageSize: number;
  count: number;
  basePath: string;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => `${basePath}${basePath.includes("?") ? "&" : "?"}page=${p}`;

  return (
    <nav className="flex items-center justify-between pt-4 text-sm text-text-muted">
      <span>
        Page {page} of {totalPages} · {count} total
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={clsx(
            "inline-flex size-8 items-center justify-center rounded-full border border-border",
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-bg-sunken",
          )}
        >
          <ChevronLeft className="size-4" />
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={clsx(
            "inline-flex size-8 items-center justify-center rounded-full border border-border",
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-bg-sunken",
          )}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
