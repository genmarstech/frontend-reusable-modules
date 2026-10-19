import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ExpandableText } from "./ExpandableText";

describe("ExpandableText", () => {
  it("renders the full text in the markup even while visually clamped", () => {
    const text = "Hand-finished linen, cut for a relaxed fit.";
    const html = renderToStaticMarkup(<ExpandableText text={text} />);
    expect(html).toContain(text);
    expect(html).toContain("line-clamp-4");
  });

  it("shows no toggle for text short enough that clamping would never hide anything", () => {
    const html = renderToStaticMarkup(<ExpandableText text="A shirt." />);
    expect(html).not.toContain("Show more");
  });

  it("shows a 'Show more' toggle for a long description", () => {
    const text = "A".repeat(300);
    const html = renderToStaticMarkup(<ExpandableText text={text} />);
    expect(html).toContain("Show more");
  });
});
