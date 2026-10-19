"use client";

import { ErrorState } from "@/components/ui/States";

/**
 * Catches anything thrown and NOT already handled inside page.tsx's own
 * try/catch (ApiError/NetworkError are handled there and rendered inline —
 * this is the backstop for anything else, a genuine bug, not an expected
 * API failure).
 */
export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <ErrorState title="Something went wrong" detail={error.message} />;
}
