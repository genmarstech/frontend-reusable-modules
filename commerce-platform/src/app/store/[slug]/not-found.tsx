import { EmptyState } from "@/components/ui/States";

/**
 * Deliberately one message for both an unknown slug and a suspended
 * business — the API itself refuses to tell those two apart (identical
 * 404, see docs/API_CONTRACT.md), and a frontend that tried to guess
 * which one it was looking at would just be fabricating a distinction the
 * backend doesn't make.
 */
export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <EmptyState
        title="Store not found"
        description="This store doesn't exist, or isn't open right now."
      />
    </div>
  );
}
