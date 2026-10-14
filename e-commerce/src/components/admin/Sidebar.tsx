"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ClipboardList,
  CreditCard,
  Users,
  Settings as SettingsIcon,
  Store,
  X,
} from "lucide-react";
import { useSidebarOpen } from "./MobileMenu";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebarOpen();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-admin-sidebar text-admin-sidebar-ink transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Store className="size-5 text-admin-accent" />
            <span className="font-semibold text-white">genmars admin</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-admin-sidebar-ink hover:text-white lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-admin-sidebar-active text-white" : "hover:bg-admin-sidebar-active/60 hover:text-white",
                )}
              >
                <Icon className={clsx("size-4", active && "text-admin-accent")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link href="/" className="block rounded-lg px-3 py-2 text-xs text-admin-sidebar-ink hover:text-white">
            ← Back to store
          </Link>
        </div>
      </aside>
    </>
  );
}
