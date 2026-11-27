import type { NextConfig } from "next";

// A static export: the site has no server of its own yet. If the client
// takes up a backend it will live in ../backend, and only the quote
// form's submit step needs to change (see src/lib/quoteRequest.ts).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
