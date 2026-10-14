"use client";

import { createContext, useContext, useState } from "react";
import { Menu } from "lucide-react";

interface MobileMenuValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuValue | null>(null);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileMenuContext.Provider value={{ open, setOpen }}>{children}</MobileMenuContext.Provider>;
}

function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) throw new Error("useMobileMenu must be used within MobileMenuProvider");
  return ctx;
}

/** Rendered inside the (server) Topbar — the sidebar's open state lives in
 * this client-only context so a Server Component can still host the button. */
export function MenuButton() {
  const { setOpen } = useMobileMenu();
  return (
    <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-text-muted hover:text-text lg:hidden">
      <Menu className="size-5" />
    </button>
  );
}

export function useSidebarOpen() {
  return useMobileMenu();
}
