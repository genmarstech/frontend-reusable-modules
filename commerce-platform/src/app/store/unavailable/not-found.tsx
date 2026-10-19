import { EmptyState } from "@/components/ui/States";

/**
 * Same copy as /store/[slug]/not-found.tsx, deliberately duplicated
 * rather than shared via a route — this is a sibling segment
 * (/store/unavailable), not a child of /store/[slug], so it does not
 * inherit that route's own not-found.tsx. See page.tsx in this folder for
 * why this detour through a second, data-free route exists at all.
 */
export default function StoreUnavailableNotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <EmptyState
        title="Store not found"
        description="This store doesn't exist, or isn't open right now."
      />
    </div>
  );
}
