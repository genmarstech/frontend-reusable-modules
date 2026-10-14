import type { User } from "@/lib/types";
import { LogoutButton } from "@/components/storefront/LogoutButton";
import { MenuButton } from "./MobileMenu";

export function Topbar({ user }: { user: User }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-admin-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MenuButton />
        <div>
          <p className="text-sm font-medium text-text">{user.first_name || user.email}</p>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
      </div>
      <LogoutButton />
    </header>
  );
}
