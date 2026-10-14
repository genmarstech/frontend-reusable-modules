"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Deliberately NOT portaled to document.body. A portal would escape
// data-theme="light" on the admin shell's wrapper (see globals.css) and
// land back under :root's dark-mode values — invisible text again. Plain
// `position: fixed` already escapes normal document flow on its own, as
// long as no ancestor holds a transform/filter/contain (none here do), so
// there's nothing a portal would actually buy this component.
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-raised p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
