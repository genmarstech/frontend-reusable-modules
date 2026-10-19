import { describe, expect, it } from "vitest";

import { composeDescription, parseDescription } from "./descriptionFields";

describe("composeDescription", () => {
  it("writes each filled field as its own emoji-prefixed line", () => {
    const text = composeDescription({ material: "100% Cotton", fit: "Regular fit", care: "Machine wash cold", notes: "" });
    expect(text).toBe("🧵 Material: 100% Cotton\n📏 Fit: Regular fit\n🧺 Care: Machine wash cold");
  });

  it("skips a field entirely when it's empty, rather than writing a blank label", () => {
    const text = composeDescription({ material: "100% Cotton", fit: "", care: "", notes: "" });
    expect(text).toBe("🧵 Material: 100% Cotton");
  });

  it("puts free-text notes after the structured lines, separated by a blank line", () => {
    const text = composeDescription({ material: "100% Cotton", fit: "", care: "", notes: "Runs slightly large." });
    expect(text).toBe("🧵 Material: 100% Cotton\n\nRuns slightly large.");
  });

  it("returns just the notes, unprefixed, when no structured field is filled in", () => {
    expect(composeDescription({ material: "", fit: "", care: "", notes: "A plain description." })).toBe(
      "A plain description."
    );
  });

  it("returns an empty string when nothing at all was entered", () => {
    expect(composeDescription({ material: "", fit: "", care: "", notes: "" })).toBe("");
  });
});

describe("parseDescription", () => {
  it("reads a composed description back into its original fields", () => {
    const composed = composeDescription({
      material: "100% Cotton",
      fit: "Regular fit",
      care: "Machine wash cold",
      notes: "Runs slightly large.",
    });
    expect(parseDescription(composed)).toEqual({
      material: "100% Cotton",
      fit: "Regular fit",
      care: "Machine wash cold",
      notes: "Runs slightly large.",
    });
  });

  it("puts a description written before this existed entirely into notes, nothing dropped", () => {
    const text = "A shirt. Soft and comfortable.";
    expect(parseDescription(text)).toEqual({ material: "", fit: "", care: "", notes: text });
  });

  it("round-trips a notes-only description unchanged", () => {
    const text = "Hand-finished linen, cut for a relaxed fit.";
    expect(composeDescription(parseDescription(text))).toBe(text);
  });

  it("returns every field empty for an empty description", () => {
    expect(parseDescription("")).toEqual({ material: "", fit: "", care: "", notes: "" });
  });
});
