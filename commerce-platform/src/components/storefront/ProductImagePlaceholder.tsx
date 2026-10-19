/**
 * Every seeded product has an empty `images` array (confirmed live, see
 * docs/API_CONTRACT.md) and the one URL the API ever does return for an
 * uploaded image isn't actually reachable (a separate, confirmed backend
 * bug, also documented there) — so this isn't a rare edge case to handle,
 * it's the normal case today. A plain, honest placeholder, not a fake
 * product photo.
 */
export function ProductImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-neutral-100 text-neutral-300 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}
