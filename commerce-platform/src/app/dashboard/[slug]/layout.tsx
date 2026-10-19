import Link from "next/link";
import { redirect } from "next/navigation";

import { ApiError, NetworkError } from "@/lib/api/client";
import { listMyBusinesses } from "@/lib/api/businesses";
import { getAccessToken } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ErrorState } from "@/components/ui/States";
import type { MyBusinessMembership } from "@/lib/api/types";

/**
 * This business's own ops surface — orders, payments, customers,
 * inventory, settings, members. Every page under here still makes its own
 * independent backend call with the caller's own token; this layout's
 * membership lookup is ONLY for deciding what the nav shows (an owner
 * shouldn't see a "Settings" link if the backend would 403 it) — never
 * the authorization check itself, same reasoning as /dashboard/page.tsx's
 * own getDashboard() comment: the backend re-verifies on every request.
 *
 * `instant = false` — same per-request, authorization-gated reasoning as
 * every other protected page in this module.
 */
export const instant = false;
export default async function BusinessOpsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`);
  }

  let memberships: MyBusinessMembership[];
  try {
    memberships = await listMyBusinesses(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/dashboard/${slug}`)}&reason=session_expired`);
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  const membership = memberships.find((m) => m.business.slug === slug && m.status === "active");
  if (!membership) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Access to this business could not be confirmed"
          detail="Your membership may have changed, or this business doesn't exist. Try again, or contact the business owner."
        />
      </div>
    );
  }

  const canManage = membership.role === "owner" || membership.role === "manager";
  const isOwner = membership.role === "owner";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <Link href="/dashboard" className="text-xs text-neutral-500 hover:underline">
            ← Your businesses
          </Link>
          <h1 className="text-lg font-semibold">{membership.business.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <nav className="mt-4 flex flex-wrap gap-4 border-b border-neutral-200 pb-3 text-sm">
        <NavLink href={`/dashboard/${slug}`}>Overview</NavLink>
        <NavLink href={`/dashboard/${slug}/orders`}>Orders</NavLink>
        <NavLink href={`/dashboard/${slug}/payments`}>Payments</NavLink>
        <NavLink href={`/dashboard/${slug}/customers`}>Customers</NavLink>
        <NavLink href={`/dashboard/${slug}/inventory`}>Inventory</NavLink>
        {canManage && <NavLink href={`/dashboard/${slug}/settings`}>Settings</NavLink>}
        <NavLink href={`/dashboard/${slug}/members`}>Members{isOwner ? "" : " (view only)"}</NavLink>
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-neutral-600 hover:text-neutral-900 hover:underline">
      {children}
    </Link>
  );
}
