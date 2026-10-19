import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "./csrf";

function request(opts: {
  origin?: string | null;
  host?: string | null;
  forwardedProto?: string;
}): NextRequest {
  const headers = new Headers();
  if (opts.origin !== null && opts.origin !== undefined) headers.set("origin", opts.origin);
  if (opts.host !== null && opts.host !== undefined) headers.set("host", opts.host);
  if (opts.forwardedProto) headers.set("x-forwarded-proto", opts.forwardedProto);
  return new NextRequest("http://localhost:3040/api/auth/login", {
    method: "POST",
    headers,
  });
}

describe("isSameOriginRequest", () => {
  it("accepts a matching Origin and Host, same scheme (unproxied, e.g. local dev)", () => {
    expect(isSameOriginRequest(request({ origin: "http://localhost:3040", host: "localhost:3040" }))).toBe(true);
  });

  it("rejects a different Origin host entirely", () => {
    expect(
      isSameOriginRequest(request({ origin: "http://evil.example.com", host: "localhost:3040" }))
    ).toBe(false);
  });

  it("rejects a missing Origin header rather than treating it as same-origin", () => {
    expect(isSameOriginRequest(request({ origin: null, host: "localhost:3040" }))).toBe(false);
  });

  it("rejects a missing Host header rather than treating it as same-origin", () => {
    expect(isSameOriginRequest(request({ origin: "http://localhost:3040", host: null }))).toBe(false);
  });

  it("rejects an Origin that differs only by scheme, unproxied", () => {
    expect(isSameOriginRequest(request({ origin: "https://localhost:3040", host: "localhost:3040" }))).toBe(
      false,
    );
  });

  it("rejects an Origin that differs only by port", () => {
    expect(isSameOriginRequest(request({ origin: "http://localhost:9999", host: "localhost:3040" }))).toBe(
      false,
    );
  });

  it("accepts a real browser's https Origin behind a TLS-terminating proxy, even though request.nextUrl itself is wrong", () => {
    // THE regression this file exists to catch. Confirmed live: this
    // container runs Next's `output: "standalone"` server, which builds
    // request.nextUrl from its OWN listen address (HOSTNAME/PORT env vars,
    // "0.0.0.0:3040") rather than the incoming request at all — so
    // request.nextUrl.host is "0.0.0.0:3040" here even though the real
    // request's Host header correctly says commerce.genmars.co.ke. This
    // rejected every real sign-in once deployed behind Caddy, because the
    // previous implementation compared against request.nextUrl instead of
    // the actual Host header.
    expect(
      isSameOriginRequest(
        request({ origin: "https://commerce.genmars.co.ke", host: "commerce.genmars.co.ke", forwardedProto: "https" }),
      ),
    ).toBe(true);
  });

  it("still rejects a different host even with x-forwarded-proto present", () => {
    expect(
      isSameOriginRequest(
        request({ origin: "https://evil.example.com", host: "commerce.genmars.co.ke", forwardedProto: "https" }),
      ),
    ).toBe(false);
  });

  it("does not let x-forwarded-proto alone manufacture a match without a matching Origin", () => {
    expect(
      isSameOriginRequest(request({ origin: null, host: "commerce.genmars.co.ke", forwardedProto: "https" })),
    ).toBe(false);
  });

  it("falls back to the request's own protocol when unproxied (no x-forwarded-proto)", () => {
    // request.nextUrl.protocol is "http:" for a request constructed with an
    // http:// URL and no forwarded-proto header — this is the direct local
    // dev / unproxied path, still exercised without a proxy in front.
    expect(isSameOriginRequest(request({ origin: "http://localhost:3040", host: "localhost:3040" }))).toBe(
      true,
    );
    expect(isSameOriginRequest(request({ origin: "https://localhost:3040", host: "localhost:3040" }))).toBe(
      false,
    );
  });
});
