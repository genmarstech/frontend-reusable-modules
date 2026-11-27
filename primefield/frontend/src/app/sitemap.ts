import type { MetadataRoute } from "next";
import { PRODUCTS, productHref } from "@/lib/products";

// A static export has no server, so the sitemap has to be built with the
// pages rather than generated on request.
export const dynamic = "force-static";

const BASE = "https://www.primefieldagricultureltd.com";
const PAGES = ["/", "/about/", "/products/", "/quality/", "/why-us/", "/contact/", "/faqs/", "/privacy/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PAGES, ...PRODUCTS.map(productHref)].map((path) => ({ url: BASE + path }));
}
