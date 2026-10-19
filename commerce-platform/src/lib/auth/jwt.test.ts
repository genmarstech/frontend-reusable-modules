import { describe, expect, it } from "vitest";

import { decodeJwtPayload, isExpiredOrInvalid } from "./jwt";

function fakeJwt(payload: Record<string, unknown>): string {
  const base64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  // Signature is never verified by decodeJwtPayload — any string works.
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(payload)}.fake-signature`;
}

describe("decodeJwtPayload", () => {
  it("decodes a well-formed token's claims", () => {
    const token = fakeJwt({ exp: 123, user_id: "1" });
    expect(decodeJwtPayload(token)).toEqual({ exp: 123, user_id: "1" });
  });

  it("returns null for a malformed token (wrong segment count)", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("a.b")).toBeNull();
  });

  it("returns null for a token whose payload segment isn't valid base64/JSON", () => {
    expect(decodeJwtPayload("a.!!!not-base64!!!.c")).toBeNull();
  });
});

describe("isExpiredOrInvalid", () => {
  it("is true for undefined", () => {
    expect(isExpiredOrInvalid(undefined)).toBe(true);
  });

  it("is true for a malformed token", () => {
    expect(isExpiredOrInvalid("garbage")).toBe(true);
  });

  it("is true for a token with no exp claim", () => {
    expect(isExpiredOrInvalid(fakeJwt({ user_id: "1" }))).toBe(true);
  });

  it("is true for a token already past its exp claim", () => {
    const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(isExpiredOrInvalid(token)).toBe(true);
  });

  it("is true for a token inside the expiry buffer (about to expire)", () => {
    const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 5 }); // default buffer is 10s
    expect(isExpiredOrInvalid(token)).toBe(true);
  });

  it("is false for a token comfortably within its lifetime", () => {
    const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 1800 });
    expect(isExpiredOrInvalid(token)).toBe(false);
  });
});
