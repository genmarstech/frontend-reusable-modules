import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { THEME_REGISTRY } from "@/lib/themes/registry";
import { ThemedHero } from "./ThemedHero";

describe("ThemedHero", () => {
  it("renders nothing at all for the default theme — an existing store sees no new banner it never asked for", () => {
    const html = renderToStaticMarkup(
      <ThemedHero themeConfig={THEME_REGISTRY.default} storeName="Genmars Store" />
    );
    expect(html).toBe("");
  });

  it("renders the lookbook hero with the store's real name and the fashion tagline", () => {
    const html = renderToStaticMarkup(
      <ThemedHero themeConfig={THEME_REGISTRY.fashion} storeName="Acme Fashion Co" />
    );
    expect(html).toContain("Acme Fashion Co");
    expect(html).toContain(THEME_REGISTRY.fashion.hero.tagline);
  });

  it("renders the tech-spec hero banner for the electronics theme", () => {
    const html = renderToStaticMarkup(
      <ThemedHero themeConfig={THEME_REGISTRY.electronics} storeName="Circuit City KE" />
    );
    expect(html).toContain("Circuit City KE");
    expect(html).toContain(THEME_REGISTRY.electronics.hero.tagline);
  });

  it("renders the fresh-grid hero banner for the grocery theme", () => {
    const html = renderToStaticMarkup(
      <ThemedHero themeConfig={THEME_REGISTRY.grocery} storeName="Fresh Mart" />
    );
    expect(html).toContain("Fresh Mart");
    expect(html).toContain("fresh in stock");
  });
});
