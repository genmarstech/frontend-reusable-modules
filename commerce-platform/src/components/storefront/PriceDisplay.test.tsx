import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PriceDisplay } from "./PriceDisplay";

describe("PriceDisplay", () => {
  it("renders the whole amount and the fraction as a separate, raised element", () => {
    const html = renderToStaticMarkup(<PriceDisplay amount="2500.00" currency="USD" />);
    expect(html).toContain("$2,500");
    expect(html).toMatch(/<sup[^>]*>00<\/sup>/);
  });

  it("renders only the whole amount, no <sup>, for a currency with no fraction digits", () => {
    const html = renderToStaticMarkup(<PriceDisplay amount="1500" currency="JPY" />);
    expect(html).toContain("¥1,500");
    expect(html).not.toContain("<sup");
  });

  it("renders an optional prefix (e.g. 'Starting at') ahead of the amount", () => {
    const html = renderToStaticMarkup(<PriceDisplay amount="1500.00" currency="KES" prefix="Starting at " />);
    expect(html).toContain("Starting at");
    expect(html.indexOf("Starting at")).toBeLessThan(html.indexOf("1,500"));
  });

  it("renders nothing extra when no prefix is given", () => {
    const html = renderToStaticMarkup(<PriceDisplay amount="1500.00" currency="KES" />);
    expect(html).not.toContain("Starting at");
  });
});
