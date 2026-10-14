import { type NextRequest, NextResponse } from "next/server";
import { readSessionCookies } from "@/lib/auth-cookies";

const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8010";

/**
 * The one door client-side JS has onto Django. A Client Component never
 * calls Django directly (no JWT in the browser to call it with) — it calls
 * `/api/proxy/<django path>` same-origin, and this forwards the request
 * with the session's bearer token attached, server-side.
 *
 * Used for client-side data (TanStack Query in the admin tables, any
 * post-hydration storefront interaction) — Server Components/Actions use
 * `lib/django.ts`'s `djangoFetch()` directly instead, since they're already
 * running server-side and don't need the extra hop.
 *
 * Auth's own token-issuing endpoints (login/register/refresh/logout) are
 * NOT behind this proxy — they have dedicated routes in app/api/auth/ that
 * set the session cookie, which this generic forwarder never touches.
 */
async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const { access } = await readSessionCookies();

  const target = `${DJANGO_API_URL}/api/${path.join("/")}/${request.nextUrl.search}`;

  const headers: Record<string, string> = {};
  if (access) headers.Authorization = `Bearer ${access}`;

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      headers["Content-Type"] = request.headers.get("content-type") ?? "application/json";
      body = text;
    }
  }

  const upstream = await fetch(target, { method: request.method, headers, body, cache: "no-store" });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
