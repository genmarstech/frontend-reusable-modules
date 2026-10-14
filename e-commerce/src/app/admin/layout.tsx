import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/session";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { MobileMenuProvider } from "@/components/admin/MobileMenu";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  // The real authorization boundary is Django's IsAdminUser on every
  // /api/ops/* call — this is just what decides whether to show the shell
  // at all, so a non-staff customer who lands on /admin sees an
  // explanation rather than a confusing empty dashboard full of 403s.
  const staff = await isStaff();
  if (!staff) {
    return (
      <div
        data-theme="light"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-admin-canvas px-4 text-center"
      >
        <ShieldAlert className="size-10 text-text-muted" />
        <div>
          <p className="font-medium text-text">You don&apos;t have access to this</p>
          <p className="mt-1 text-sm text-text-muted">The admin area is for Genmars staff accounts only.</p>
        </div>
        <Link href="/">
          <Button variant="secondary">Back to the store</Button>
        </Link>
      </div>
    );
  }

  return (
    <MobileMenuProvider>
      <div data-theme="light" className="flex min-h-screen bg-admin-canvas">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </MobileMenuProvider>
  );
}
