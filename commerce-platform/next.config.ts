import path from "node:path";
import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// next.config.ts runs OUTSIDE the Next.js runtime's own env-file loading —
// `.env.local` is only read later, as part of starting that runtime — so
// `process.env.API_BASE_URL` is undefined here unless loaded explicitly.
// Confirmed live: without this, `images.remotePatterns` below silently
// resolved to `[]`, and next/image's optimizer rejected every real
// product image with "url parameter is not allowed" (a config problem,
// not the already-documented unreachable-media-URL one — see
// docs/API_CONTRACT.md). `@next/env` is the package Next's own docs name
// for this exact situation; it ships as part of `next` itself.
loadEnvConfig(path.join(__dirname));

// Evaluated by Next at build/start time, server-side only — this never
// ships to the browser, same as reading it in src/lib/api/config.ts. Read
// directly rather than through that module's `required()` helper because
// next.config.ts loads before anything in src/ does and must not throw if
// the var is briefly unset (next/image config degrades to an empty
// allowlist instead, not a build crash).
const backendOrigin = process.env.API_BASE_URL ? new URL(process.env.API_BASE_URL) : undefined;

// Next 16 refuses to optimize an image from a private/loopback IP by
// default (SSRF hardening) unless `dangerouslyAllowLocalIP` says so —
// confirmed live: it logged "hostname resolved to private IP ... If this
// is expected and you understand SSRF risk, use
// images.dangerouslyAllowLocalIP". Scoped to an actual loopback hostname
// rather than turned on unconditionally: a real deployment's
// API_BASE_URL is a public hostname (api.genmars.co.ke-style), where this
// stays false and the SSRF guard keeps doing its job. It's only `.env`
// files pointing local dev/rehearsal backends at `localhost` that need it.
const isLoopbackBackend = backendOrigin ? ["localhost", "127.0.0.1", "::1"].includes(backendOrigin.hostname) : false;

const nextConfig: NextConfig = {
  /* config options here */
  // Only consumed by Dockerfile's production build (see the backend repo's
  // docs/HETZNER_DEPLOYMENT.md, which covers both repos' pieces) — traces a
  // self-contained server into
  // .next/standalone so the runtime image needs no node_modules tree. `npm
  // run dev`/`next start` outside Docker are unaffected; this only changes
  // what `next build` additionally writes out.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Next's own default (1 MB) refuses a real product photo before the
      // request even reaches uploadProductImageAction — confirmed live as
      // "Body exceeded 1 MB limit." on the dashboard's image upload. Set
      // just past the backend's own cap (PRODUCT_IMAGE_MAX_BYTES, 5MB, plus
      // headroom for the surrounding multipart body — see that repo's
      // config/settings.py) rather than far past it: the point is to let a
      // request through to the backend's own validator, which explains a
      // genuinely-too-large image, instead of this limit silently eating
      // it first with no application-level message at all.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // ProductImage.image serializes as an absolute URL on the Django
    // host (confirmed live, see docs/API_CONTRACT.md) — never this
    // frontend's own origin, so next/image needs it allowlisted
    // explicitly. Empty when API_BASE_URL is unset rather than a guess.
    remotePatterns: backendOrigin
      ? [
          {
            protocol: backendOrigin.protocol.replace(":", "") as "http" | "https",
            hostname: backendOrigin.hostname,
            port: backendOrigin.port || undefined,
          },
        ]
      : [],
    dangerouslyAllowLocalIP: isLoopbackBackend,
  },
  turbopack: {
    // Pins the project root explicitly — without this, Turbopack's own
    // root-detection walks up looking for a lockfile and can land outside
    // this repo (e.g. a stray lockfile elsewhere on the machine), which
    // produced a harmless but noisy warning on every build.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
