"use client";

import { ErrorState } from "@/components/ui/States";

/**
 * Backstop for page.tsx and below — ApiError/NetworkError from its own
 * fetches are already caught and rendered inline there, so reaching here
 * means a genuine bug. A NetworkError thrown out of this segment's own
 * layout.tsx does NOT land here (an error boundary never catches an error
 * thrown by its own layout) — that one surfaces at the root error.tsx
 * instead.
 */
export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <ErrorState title="Something went wrong" detail={error.message} />;
}
