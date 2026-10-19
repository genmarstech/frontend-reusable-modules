"use client";

import { useState } from "react";

/**
 * Clamps a product's free-text description to a few lines with a
 * "Show more"/"Show less" toggle, the same reason Amazon's own product
 * pages do it: a long description shouldn't push the buy box (or, on the
 * fashion theme's lookbook layout, the rest of the page) below the fold on
 * first paint. The full text is always in the DOM — `line-clamp` only
 * hides the overflow visually — so a crawler or screen reader still gets
 * all of it; this component only changes what a sighted visitor sees
 * before they ask for more.
 *
 * The toggle itself doesn't render at all for text short enough that
 * clamping would never actually hide anything — the 240-character mark is
 * an approximation (line-clamp-4 at this component's usual widths), not a
 * measured one, since measuring real layout would need a DOM, which this
 * renders on the server as readily as the client.
 */
export function ExpandableText({ text, className = "" }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const mightOverflow = text.length > 240;

  return (
    <div>
      <p className={`whitespace-pre-line ${expanded ? "" : "line-clamp-4"} ${className}`}>{text}</p>
      {mightOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium text-neutral-500 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
