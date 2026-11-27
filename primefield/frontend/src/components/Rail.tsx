"use client";

import { useRef, useState, type ReactNode } from "react";

// A product grid that becomes a swipeable row on a phone (see .grid.rail
// in enhance.css). On wider screens it is the ordinary grid, and the dots
// are hidden there by CSS.
export default function Rail({ children, count }: { children: ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    setAt(Math.round(el.scrollLeft / (card.offsetWidth + 14)));
  };
  return (
    <>
      <div className="grid rail" ref={ref} onScroll={onScroll}>{children}</div>
      <div className="rail-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => <span key={i} className={i === Math.min(at, count - 1) ? "on" : undefined} />)}
      </div>
    </>
  );
}
