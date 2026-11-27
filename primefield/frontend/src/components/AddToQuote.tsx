"use client";

import { toggleQuote, useQuote } from "@/lib/quote";

export default function AddToQuote({ id, className = "add" }: { id: string; className?: string }) {
  const on = useQuote().includes(id);
  return (
    <button type="button" className={className} aria-pressed={on} onClick={() => toggleQuote(id)}>
      {on ? "✓ In your quote" : "+ Add to quote"}
    </button>
  );
}
