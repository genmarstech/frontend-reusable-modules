# Genmars Commerce Platform — frontend

The frontend for Genmars Tech's multi-tenant commerce platform, against
the `e-commerce-backend` repo's multi-tenant backend. This is a sibling
module to `../e-commerce` (a different, single-tenant-era frontend in this
same repo) — separate because the backend it talks to is a different,
incompatible API shape (`/api/<business_slug>/...` routing, which didn't
exist when `e-commerce` was built).

**Current state**: a typed API client over every endpoint this backend
exposes to a customer or a single business's own dashboard; cookie-based BFF
auth (register, login, logout, refresh); a public storefront (catalog
browsing, a product page with single-dimension variant selection); and the
full customer purchase loop — cart, checkout (saved address or a manual one),
order history, order detail with M-Pesa initiate and self-service
cancellation. A `/dashboard` page shows a signed-in business member's own
businesses and that business's summary numbers. Not built: anything beyond
that one dashboard page for the business-ops side (orders/payments/customers/
settings/members at `/api/ops/<slug>/...` — see docs/API_CONTRACT.md's
"Business operations" table for what exists on the backend but has no page
here yet).

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4 — matching the
sibling `e-commerce` module's conventions in this repo.

## Local setup

1. The backend (`e-commerce-backend`, this same `softwares` org) must be
   running locally — `manage.py runserver`, with Postgres up via its own
   `docker-compose.yml`, migrated and (optionally) seeded via
   `manage.py seed_catalog`.
2. `cp .env.example .env.local` and point `API_BASE_URL` at that backend.
3. `npm install`
4. `npm run dev -- -p 3040` (3000/3030 are taken by the sibling module on
   this machine — pick whatever's free in your own environment, and update
   the backend's `CORS_ALLOWED_ORIGINS` to match if it isn't 3000).

## What's actually verified vs. documented from source

`docs/API_CONTRACT.md` marks every endpoint **LIVE** (actually called
against a running backend during this phase) or **INSPECTED** (read from
the backend's serializer/view source, not called over HTTP yet). Read that
file before building anything against an endpoint it marks INSPECTED —
it's accurate as of the backend commit it names, not a guarantee the
backend hasn't changed since.

## Commands

```bash
npm run dev       # dev server
npm run build     # production build (also runs TypeScript)
npm run lint       # ESLint
npx tsc --noEmit  # TypeScript only, no build artifacts
```
