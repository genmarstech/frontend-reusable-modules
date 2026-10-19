import { describe, expect, it } from "vitest";

import { THEME_REGISTRY, getThemeConfig } from "./registry";
import { STORE_THEMES } from "./types";

describe("THEME_REGISTRY", () => {
  it("has exactly one entry per STORE_THEMES value — no more, no fewer", () => {
    expect(Object.keys(THEME_REGISTRY).sort()).toEqual([...STORE_THEMES].sort());
  });

  it("every entry's own key matches the registry key it's stored under", () => {
    for (const key of STORE_THEMES) {
      expect(THEME_REGISTRY[key].key).toBe(key);
    }
  });

  it("the default theme renders no hero banner, matching pre-theming behavior", () => {
    expect(THEME_REGISTRY.default.hero.style).toBe("none");
  });

  it("every themed (non-default) entry has a real tagline for its hero", () => {
    for (const key of STORE_THEMES) {
      if (key === "default") continue;
      expect(THEME_REGISTRY[key].hero.tagline.length).toBeGreaterThan(0);
    }
  });
});

describe("getThemeConfig", () => {
  it("returns the matching registry entry for each theme", () => {
    for (const key of STORE_THEMES) {
      expect(getThemeConfig(key)).toBe(THEME_REGISTRY[key]);
    }
  });
});
