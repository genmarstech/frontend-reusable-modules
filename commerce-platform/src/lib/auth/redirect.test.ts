import { describe, expect, it } from "vitest";

import { sanitizeNextPath } from "./redirect";

describe("sanitizeNextPath", () => {
  it("accepts a plain relative path", () => {
    expect(sanitizeNextPath("/dashboard/acme")).toBe("/dashboard/acme");
  });

  it("falls back for null/undefined/empty", () => {
    expect(sanitizeNextPath(null)).toBe("/dashboard");
    expect(sanitizeNextPath(undefined)).toBe("/dashboard");
    expect(sanitizeNextPath("")).toBe("/dashboard");
  });

  it("rejects a protocol-relative URL (//evil.com)", () => {
    expect(sanitizeNextPath("//evil.com")).toBe("/dashboard");
  });

  it("rejects an absolute URL smuggled in as a path", () => {
    expect(sanitizeNextPath("/x?u=https://evil.com")).toBe("/dashboard");
  });

  it("rejects a bare external URL", () => {
    expect(sanitizeNextPath("https://evil.com/dashboard")).toBe("/dashboard");
  });

  it("rejects a path that doesn't start with /", () => {
    expect(sanitizeNextPath("dashboard")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeNextPath("//evil.com", "/home")).toBe("/home");
  });
});
