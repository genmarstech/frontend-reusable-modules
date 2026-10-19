import Link from "next/link";

/**
 * Phase 1's "integration check" page lived here and hit a hardcoded
 * DEFAULT_BUSINESS_SLUG — removed in Phase 3 along with that env var (see
 * docs/API_CONTRACT.md). There is no public directory of businesses (same
 * confirmed gap documented there), so a generic platform root has nothing
 * real to fetch or list: no API call, no business identity baked in here.
 * A real storefront lives at /store/<slug>, reached by whatever channel
 * gave the visitor that business's slug in the first place (their own
 * link, QR code, etc.) — not from this page.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-xl font-semibold tracking-tight">Genmars Commerce Platform</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Multi-tenant storefronts and staff tooling, built on one shared backend.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Staff sign in
      </Link>
    </div>
  );
}
