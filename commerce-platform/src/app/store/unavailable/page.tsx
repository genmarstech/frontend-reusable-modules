import { notFound } from "next/navigation";

/**
 * Rewrite target, never a link a visitor follows directly — `src/proxy.ts`
 * sends an unknown/suspended store slug here instead of letting
 * `/store/[slug]` render. The reason this file exists at all rather than
 * just calling notFound() inside that dynamic route: a route with zero
 * data dependencies can be resolved at build time, so Next.js serves it
 * with a real 404 status before any streaming starts (confirmed live —
 * see this project's final report and
 * node_modules/next/dist/docs/.../not-found.md's "Calling notFound()
 * before streaming starts returns a 404"). `/store/[slug]` itself can't
 * do that: its content depends on a per-request fetch, which Cache
 * Components mode streams in behind a Suspense boundary — and once that
 * boundary has flushed its fallback, the response's status is already
 * locked at 200, 404 UI or not.
 */
export default function StoreUnavailable() {
  notFound();
}
