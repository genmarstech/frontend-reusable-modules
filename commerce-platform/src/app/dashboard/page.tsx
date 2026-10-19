import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, NetworkError } from "@/lib/api/client";
import { getDashboard, listMyBusinesses } from "@/lib/api/businesses";
import { getAccessToken } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { DashboardSummary, MyBusinessMembership } from "@/lib/api/types";

/**
 * Phase 2's one real authenticated business page. Deliberately not the
 * full dashboard: shows this user's own businesses (from the endpoint
 * added this phase specifically because none existed) and one real,
 * authorized piece of data for the first of them. A user with no
 * memberships gets an honest empty state, not a fabricated one.
 *
 * `instant = false`: Next's Cache Components mode (next.config.ts)
 * requires a session read to sit behind its own <Suspense> boundary with
 * `use cache: private` to be part of an "instant" client-side navigation
 * — the framework's own documented pattern for this is a real restructure
 * (see node_modules/next/dist/docs/.../authentication-with-cache-
 * components.md), not something to half-do for a single foundation page.
 * That same doc names this exact flag as the sanctioned way to keep a
 * route blocking on the server while deferring that adoption — which is
 * correct here anyway: every byte of this page is per-user and
 * authorization-gated, so there is no static shell worth prerendering
 * ahead of the request in the first place.
 */
export const instant = false;
export default async function DashboardPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    // The proxy should have already caught this — this is the backstop
    // for a Server Component reached some other way.
    redirect("/login");
  }

  let memberships: MyBusinessMembership[];
  try {
    memberships = await listMyBusinesses(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?reason=session_expired");
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  if (memberships.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <Header />
        <EmptyState
          title="You don't belong to any business yet"
          description="Ask a business owner to invite you, or create a business through the platform admin tools."
        />
      </div>
    );
  }

  const [current, ...others] = memberships;

  let dashboard: DashboardSummary;
  try {
    dashboard = await getDashboard(accessToken, current.business.slug);
  } catch (error) {
    // Not assuming the slug from our own membership list is automatically
    // authorized — this call is the backend's own, independent check, and
    // these branches are what happens if it disagrees (membership revoked
    // between the two calls, the business got suspended, etc.).
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return (
        <div className="mx-auto max-w-lg">
          <Header />
          <ErrorState
            title="Access to this business could not be confirmed"
            detail="Your membership may have changed. Try again, or contact the business owner."
          />
        </div>
      );
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Header />

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold">{current.business.name}</h2>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {current.role}
            </span>
            <Link
              href={`/dashboard/${current.business.slug}`}
              className="text-xs font-medium text-neutral-900 underline underline-offset-2"
            >
              Manage
            </Link>
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Sales total</dt>
            <dd className="font-medium">
              {current.business.default_currency} {dashboard.sales_total}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Low stock items</dt>
            <dd className="font-medium">{dashboard.low_stock_count}</dd>
          </div>
        </dl>

        {dashboard.recent_orders.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
            {dashboard.recent_orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between py-2 text-sm">
                <span>{order.reference}</span>
                <span className="text-neutral-500">
                  {order.currency} {order.total} · {order.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {others.length > 0 && (
        <p className="mt-4 text-sm text-neutral-500">
          Also a member of:{" "}
          {others.map((m, i) => (
            <span key={m.id}>
              {i > 0 && ", "}
              <Link href={`/dashboard/${m.business.slug}`} className="underline underline-offset-2">
                {m.business.name}
              </Link>
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold">Your businesses</h1>
      <LogoutButton />
    </div>
  );
}
