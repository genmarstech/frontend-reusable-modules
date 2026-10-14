# e-commerce

Next.js 16 (App Router) + TypeScript frontend for the Genmars e-commerce
backend (`~/Genmars/softwares/e-commerce-backend`): a customer storefront and
a protected staff admin dashboard, in one app.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, TanStack Query, react-hook-form
+ zod, Recharts (admin charts).

## Architecture — the backend is never called from the browser

Every Django call goes through this Next.js server, never from client-side
JS directly:

- **Server Components / Server Actions / Route Handlers** call Django via
  `lib/django.ts`'s `djangoFetch()`, which reads the session's httpOnly
  cookie and attaches it as a Bearer token.
- **Client Components** that need to fetch after hydration (admin tables,
  payment-status polling, the storefront's add-to-cart button) call
  `/api/proxy/<django path>` same-origin, which `app/api/proxy/[...path]/route.ts`
  forwards to Django with the session attached, server-side.
- **Auth** (`/api/auth/login|register|refresh|logout`) has its own routes
  that call Django's token endpoints and set `gm_access`/`gm_refresh` as
  httpOnly, Secure (in production), SameSite=Lax cookies. The browser never
  holds a JWT.
- **`src/proxy.ts`** (Next's "Proxy" file convention, née middleware) runs on
  every page navigation: it proactively refreshes a near-expired access
  token, and gates `/admin/*` on "is there a session at all". That's a cheap
  UX check only — the real authorization boundary is Django's `IsAdminUser`
  on every `/api/ops/*` call, enforced again in `app/admin/layout.tsx`
  (`isStaff()` actually calls `/api/ops/dashboard/` and checks for a 403).

See `lib/types.ts` for the full map of backend endpoints this app consumes,
kept in sync by hand with the Django serializers.

## Design tokens

`app/globals.css` — brand constants (`--ink`, `--paper`, `--accent`, …)
never change between themes; semantic tokens (`--bg`, `--text`, …) do, via
`prefers-color-scheme` or an explicit `data-theme` attribute. The storefront
is genuinely light/dark reactive. The admin shell is a fixed
light-canvas/dark-sidebar dashboard regardless of system theme — its root
wrapper sets `data-theme="light"`, which the (non-`:root`-scoped)
`[data-theme="light"]` rule in `globals.css` pins for that whole subtree.
`--inverse`/`--inverse-text` is the token pair for "always-contrasts" UI
(the primary button, active pills) — never use the `--ink` brand constant
directly for that, since it doesn't flip and goes invisible on a dark-mode
background.

## Local setup

```bash
cp .env.example .env.local   # DJANGO_API_URL — defaults to localhost:8010
npm install
npm run dev -- -p 3030       # whatever port; backend's own dev server uses 8010
```

The Django backend must be running separately (`cd ../../softwares/e-commerce-backend && docker compose up -d && ./venv/bin/python manage.py runserver 8010`).

## What's deliberately out of this pass

- **Product image upload in the admin UI.** Django admin already does this
  (inline `ProductImageInline`); building multipart upload into this form
  was cut to keep the pass scoped. `components/admin/ProductForm.tsx` only
  covers name/sku/price/status/category.
- **A sales trend chart.** The backend's `/api/ops/dashboard/` returns
  totals and counts, not a time series — there's no aggregation history to
  chart yet. `components/admin/OrdersByStatusChart.tsx` shows the
  order-status breakdown instead.
- **Product routing by slug.** `Product.slug` exists on the backend but
  isn't the DRF lookup field, so `/products/[id]` and `/checkout/[id]/pay`
  route by numeric id. Switching the backend's `ProductViewSet` lookup field
  would be a small, separate change.
