import path from "node:path";
import type { NextConfig } from "next";

// Product images come back from DRF as absolute URLs on the Django host
// (ImageField + request context), so next/image needs that host allowed —
// read straight from the same server-only env var lib/django.ts uses rather
// than duplicating it as a NEXT_PUBLIC_ one.
const djangoApiUrl = process.env.DJANGO_API_URL ?? "http://localhost:8010";
const djangoHost = new URL(djangoApiUrl);

const nextConfig: NextConfig = {
  // Without this, Turbopack's root-inference walks up looking for a
  // lockfile and finds an unrelated one at ~/package-lock.json, which isn't
  // this project's root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: djangoHost.protocol.replace(":", "") as "http" | "https",
        hostname: djangoHost.hostname,
        port: djangoHost.port,
      },
    ],
  },
};

export default nextConfig;
