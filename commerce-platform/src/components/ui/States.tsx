/**
 * The three states every data-fetching page needs, kept identical in shape
 * so a page doesn't invent its own look for "nothing here yet" versus
 * "something broke" — Phase 2's real pages reuse these rather than each
 * writing their own.
 */

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-neutral-500" role="status">
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-16 text-center">
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

/**
 * `detail` is whatever ApiError.message / NetworkError.message already
 * produced — both are written to be safe to show directly (see
 * src/lib/api/client.ts), never a raw stack trace or the backend's own
 * exception text.
 */
export function ErrorState({ title = "Something went wrong", detail }: { title?: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-red-200 bg-red-50 py-10 text-center">
      <p className="text-sm font-medium text-red-800">{title}</p>
      {detail && <p className="text-sm text-red-600">{detail}</p>}
    </div>
  );
}
