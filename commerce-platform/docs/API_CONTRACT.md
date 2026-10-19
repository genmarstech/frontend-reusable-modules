# Backend API contract — verified, Phase 1

Everything below was read from the actual backend source at
`genmarstech/softwares`, path `e-commerce-backend/`, commit `46f1fdd`
(merged to `main` as `0c5b9fc`) — not inferred from a plan or an earlier
summary. Each endpoint is marked:

- **LIVE** — actually called against a running local instance of the
  backend during this phase, response inspected directly.
- **INSPECTED** — read from the serializer/view/URL source; not called
  over HTTP in this phase.

## Base URL and routing

Every endpoint is relative to `API_BASE_URL` (e.g. `http://localhost:8010`
in local dev). There is no API version prefix.

```
/health/                 — unauthenticated readiness check
/api/auth/...            — registration, login, refresh, logout, password reset
/api/me/                 — the signed-in user's own profile
/api/addresses/          — the signed-in user's own saved addresses
/api/<business_slug>/... — one business's storefront (public + authenticated)
/api/ops/platform/...    — Genmars platform administration (is_staff only)
/api/ops/<business_slug>/...
                          — one business's own staff/owner/manager surface
/api/payments/mpesa/callback/<token>/
                          — Safaricom's own callback. Never called by this
                            frontend, documented only so it isn't mistaken
                            for something that is.
```

`<business_slug>` is a routing segment, not a secret or a session concept
— it identifies which business's storefront or back office a request is
for. The backend resolves it from the URL on every request; it is never
inferred from a cookie or a token (`businesses/resolution.py`).

## Authentication — verified LIVE

**Mechanism**: JWT bearer tokens (`djangorestframework-simplejwt`), returned
directly in the response body. There is no cookie-based session for the
API and no CSRF token requirement for API calls — `Authorization: Bearer
<access_token>` on every authenticated request is the entire mechanism.
This is read from `config/settings.py`'s `REST_FRAMEWORK` and `SIMPLE_JWT`
blocks and confirmed live below; nothing about it was invented for this
frontend.

| Endpoint | Method | Verified |
|---|---|---|
| `/api/auth/register/` | POST | **LIVE** |
| `/api/auth/login/` | POST | **LIVE** |
| `/api/auth/refresh/` | POST | INSPECTED (`TokenRefreshView`, stock `simplejwt`) |
| `/api/auth/logout/` | POST | INSPECTED |
| `/api/auth/password-reset/` | POST | INSPECTED |
| `/api/auth/password-reset/confirm/` | POST | INSPECTED |
| `/api/me/` | GET, PATCH | **LIVE** (GET only) |
| `/api/addresses/` | GET, POST | INSPECTED |
| `/api/addresses/{id}/` | GET, PATCH, DELETE | INSPECTED |

### `POST /api/auth/register/`

Request: `{"email": string, "password": string, "first_name"?: string, "last_name"?: string, "phone_number"?: string}`

Response `201`, confirmed live:
```json
{
  "user": {"id": 1, "email": "frontend-check@example.com", "first_name": "", "last_name": "", "phone_number": "", "date_joined": "2026-10-15T00:01:19.742488+03:00"},
  "access": "<jwt>",
  "refresh": "<jwt>"
}
```

Response `400` on duplicate email, confirmed live: `{"detail": "An account with that email already exists."}`

Response `400` on invalid payload, confirmed live:
```json
{"email": ["Enter a valid email address."], "password": ["This password is too short. It must contain at least 8 characters.", "This password is too common."]}
```
This is the general shape for **every** field-validation error on this
backend, not specific to registration — see "Error format" below.

### `POST /api/auth/login/`

Request: `{"email": string, "password": string}`. Response `200`: same
`{user, access, refresh}` shape as register. Response `401` on bad
credentials: `{"detail": "That email address and password do not match."}`
— deliberately identical whether the email exists or not
(`accounts/identity.py`'s own stated anti-enumeration policy).

### `GET /api/me/` — confirmed LIVE with a real bearer token

```json
{"id": 1, "email": "frontend-check@example.com", "first_name": "", "last_name": "", "phone_number": "", "date_joined": "..."}
```
`401` with no token, confirmed live: `{"detail": "Authentication credentials were not provided."}`

### Token lifetimes (`config/settings.py::SIMPLE_JWT`, inspected)

Access: 30 minutes. Refresh: 7 days, rotated on each use, old one
blacklisted (`ROTATE_REFRESH_TOKENS` + `BLACKLIST_AFTER_ROTATION`).

## Phase 2 additions — verified against the actual source, not called live

Phase 2 needs exact refresh/logout/identity behavior that Phase 1 didn't
need. Confirmed by reading the installed `djangorestframework-simplejwt`
package's own source (`venv/lib/.../rest_framework_simplejwt/{views,serializers}.py`)
and `accounts/views.py` again — not re-called live, because doing so here
would require a running backend mid-documentation-pass; Step 2's actual
BFF implementation calls these for real and that's reported separately.

### `POST /api/auth/refresh/` — INSPECTED, from simplejwt's actual serializer

Request: `{"refresh": "<token>"}`. Because `ROTATE_REFRESH_TOKENS=True` in
this backend's settings, `TokenRefreshSerializer.validate()` returns:
```json
{"access": "<new jwt>", "refresh": "<new jwt>"}
```
**Both fields are always present** when rotation is on — not just
`access`. Because `BLACKLIST_AFTER_ROTATION=True` as well, the OLD refresh
token is blacklisted server-side in the same call — a BFF that refreshes
and then throws away the new `refresh` value (keeping the old one) would
make every subsequent refresh fail, not just rotate uselessly. The access
token returned here carries the user's identity the same way login's does
— no separate "who is this" call is needed after a refresh.

On an invalid/expired/blacklisted refresh token: `401`,
`{"detail": "Token is invalid or expired", "code": "token_not_valid"}`
(simplejwt's own `InvalidToken` exception shape — confirmed from
`rest_framework_simplejwt/exceptions.py`, not this backend's own
`core.exceptions` handler, since `TokenRefreshView` raises before DRF's
generic handling would apply a different shape).

### `POST /api/auth/logout/` — INSPECTED, `accounts/views.py::LogoutView`

Requires `Authorization: Bearer <access_token>` (`IsAuthenticated`) —
logout itself is an authenticated call, not an unauthenticated "clear
whatever." Body: `{"refresh": "<token>"}` (optional). If present, that
refresh token is blacklisted; if it's already invalid/expired, the view
swallows the error and still returns `204` — **logout always succeeds from
the caller's point of view**, matching the comment in the source: "Already
invalid/expired — logout is still a success." If no `refresh` is sent,
nothing is blacklisted and it's still `204` — the access token itself is
never blacklisted by this endpoint (simplejwt has no access-token
blacklist; only refresh tokens are revocable). This matters for the BFF:
the access cookie still needs to be deleted locally regardless of what the
backend call does, since the backend has no way to revoke an
already-issued access token before its own 30-minute expiry.

### How the backend identifies the current user — INSPECTED + LIVE (Phase 1)

Purely from the JWT's own claims via `JWTAuthentication` — there is no
session store, no server-side "who's logged in" table to query. `GET
/api/me/` is the one endpoint that turns "a valid access token" into "this
user's profile," confirmed live in Phase 1. There is no separate "verify
this token" endpoint exposed by this backend (simplejwt has one,
`TokenVerifyView`, but it is not wired into `accounts/urls.py` —
confirmed by reading that file again: only `register`, `login`, `refresh`,
`logout`, the two password-reset views, `me/`, and the `addresses`
router are registered).

### Business membership listing — confirmed gap, then closed

Searched the entire backend for any endpoint that lists "the businesses
this authenticated user belongs to," without already knowing a business
slug, and found none:

- `businesses/ops_views.py::OpsMembershipViewSet` — the only endpoint that
  lists `BusinessMembership` rows — requires `business_slug` resolved
  *first* (`BusinessScopedMixin.initial()` runs before anything else and
  404s if the slug doesn't exist). It lists **that business's** members,
  which is a different question from "which businesses am I a member of."
- `accounts/serializers.py::UserSerializer` (what `/api/me/` returns) had
  no memberships field.
- `grep -rn "BusinessMembership.objects.filter" --include="*.py"` across
  the whole backend: every call site filtered by `business=` (needs a
  business already) or by `pk=`/exact lookups in tests — none filtered by
  `user=` alone to answer "list mine."

This was reported to the user before Step 4 was attempted, per the
explicit instruction not to fabricate membership data. The user chose to
add a minimal, additive backend endpoint rather than route around the gap
in the frontend — implemented, tested, and verified live in this phase:

### `GET /api/me/businesses/` — verified LIVE (new this phase)

`accounts/views.py::MyBusinessesView`. `IsAuthenticated`. Filters
`BusinessMembership.objects.filter(user=request.user, status="active")`
— `user=request.user` only, never anything client-supplied, so there is
no id this endpoint could be handed that would widen it to another
user's rows. **Not paginated** — a person's own membership count is
always small; forcing `{count, next, previous, results}` onto a handful
of rows would be a strange shape for this one endpoint alone.

Response `200`, confirmed live:
```json
[
  {
    "id": 1,
    "business": {
      "id": 1, "name": "Genmars Store", "slug": "genmars-store", "status": "active",
      "country": "KE", "timezone": "Africa/Nairobi", "default_currency": "KES",
      "contact_email": "", "contact_phone": "", "created_at": "..."
    },
    "role": "owner",
    "status": "active",
    "created_at": "..."
  }
]
```
A user with zero active memberships gets `[]`, `200` — not an error.
`401` with no token, confirmed live, same shape as every other
authenticated endpoint: `{"detail": "Authentication credentials were not provided."}`.
Backend test suite (`tests/test_my_businesses.py`, 6 tests, all passing)
proves: empty list for no memberships, correct shape, a second user's
memberships are never included, a user in two businesses sees both, and a
suspended (not active) membership is excluded.

## CORS — verified LIVE (Phase 1); superseded by the BFF for Phase 2

Phase 2's BFF makes the backend's CORS config mostly moot for this
module: once the browser only ever talks to this Next.js server (same
origin, no CORS involved), and this Next.js server talks to Django
server-to-server (CORS is a browser-enforced mechanism — it does not
apply to server-to-server HTTP calls at all), `CORS_ALLOWED_ORIGINS`
stops being on the request path for anything Phase 2 builds. It's left
below as-is because it's still accurate and still matters for Phase 1's
direct-browser integration check, which still exists on the same page.

Also confirmed this pass: `CORS_ALLOW_CREDENTIALS` is not set anywhere in
`config/settings.py` (defaults to `False` in `django-cors-headers`) — so
even if something browser-side ever did call Django directly again, it
could not carry cookies cross-origin regardless. Consistent with
bearer-token auth needing no cookie to cross an origin boundary.

```
CORS_ALLOWED_ORIGINS=http://localhost:3000   (config/settings.py, env-driven, explicit allowlist, never "*")
```
Preflight confirmed live against `http://localhost:3000`:
```
access-control-allow-origin: http://localhost:3000
access-control-allow-headers: accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with
access-control-allow-methods: DELETE, GET, OPTIONS, PATCH, POST, PUT
```
No `access-control-allow-credentials` header — confirmed absent, consistent
with bearer-token auth (no cookie needs to cross the origin boundary).
**This frontend's dev port is 3040** (3000/3030 were occupied by a sibling
module on this machine) — `CORS_ALLOWED_ORIGINS` only needs updating if
this frontend is ever actually run on port 3000, which it currently isn't
in this environment.

## Public storefront — catalog (verified LIVE, Phase 1 + Phase 3)

### `GET /api/<business_slug>/products/`

Confirmed live against the seeded `genmars-store` business: `200`,
paginated, 21 results. Anonymous callers see published-only products
(`catalog/views.py::ProductViewSet.get_queryset()`); an authenticated
member of that business sees drafts too — not exercised by this frontend,
since nothing in the public storefront authenticates.

Query params (INSPECTED, `catalog/filters.py` + DRF `SearchFilter`/`OrderingFilter`):
`category` (numeric category id), `status`, `min_price`, `max_price`,
`search` (name/sku), `ordering` (`price`, `created_at`), `page`.
**Correction from Phase 1's notes**: `page_size` is **not** honored —
confirmed live (`?page_size=2` still returned all 20 of a page) and from
reading `rest_framework/pagination.py` directly: `PageNumberPagination`'s
`page_size_query_param` defaults to `None`, and nothing in this backend
overrides it. Every list is always `PAGE_SIZE=20` per page, full stop. The
`next`/`previous` links **do** echo back whatever query string the request
used (including an unused `page_size`), which is what made this look
honored in a truncated terminal output the first time — worth recording
precisely since it would have been a real bug in a frontend page-size
selector.

Response shape, confirmed live:
```json
{
  "count": 21,
  "next": "http://localhost:8010/api/genmars-store/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 21, "name": "Men's Classic Fit Shirt", "slug": "mens-classic-fit-shirt",
      "description": "...", "sku": "FA-001", "price": "1800.00", "status": "published",
      "category": 3, "images": [],
      "variants": [{"id": 3, "product": 21, "name": "Size", "value": "L", "sku": "FA-001-L", "price_override": null, "price": "1800.00"}, "..."],
      "created_at": "...", "updated_at": "..."
    }
  ]
}
```
**Decimal fields (`price`, `price_override`) serialize as strings**, not
JSON numbers. **`category` is a bare numeric id, never expanded** — a
product card/detail page that needs the category's *name* must fetch
`/categories/` separately and map id → name itself; confirmed by reading
`ProductSerializer.Meta.fields` and the live response, there is no
`category_name` or nested object anywhere on this payload.

### `GET /api/<business_slug>/products/{id}/` — verified LIVE this phase

Same `ProductSerializer` shape as the list. **Keyed by numeric id, not
slug** — confirmed by calling it directly. Two different businesses' own
products can carry the **identical** auto-generated slug (confirmed live:
`genmars-store`'s product 21 and a second business's product 22 are both
`"slug": "mens-classic-fit-shirt"`, since slug uniqueness is per-business —
see Phase 3's backend review), so a route that resolved a product by slug
alone, without the business already pinning which one, would be ambiguous.
This frontend's product-detail route therefore uses the id, matching the
endpoint's own actual lookup key, not the slug.

### `GET /api/<business_slug>/categories/` — verified LIVE this phase

`{count, next, previous, results: [{id, name, slug, parent}]}` — same
pagination envelope as products, though a real store's category count is
small enough that pagination rarely matters here in practice.

### Product images — verified LIVE this phase, with a confirmed gap

`ProductImage.image` serializes as a **full absolute URL** (confirmed:
`"image": "http://localhost:8010/media/products/test-product.png"`) built
from the request's own host — not a bare path this frontend needs to
prefix itself.

**Confirmed, reproduced bug, not fixed in this phase (see "Blockers"
below): that URL is not actually reachable.** `config/urls.py` never wires
`django.conf.urls.static.static(settings.MEDIA_URL, document_root=...)`,
so nothing serves `MEDIA_ROOT` in this backend, in any environment this
project runs in locally — a direct `curl` of the URL the API itself
returned came back `404`. In practice this doesn't block Phase 3: nothing
`seed_catalog` creates has any images at all (`"images": []` on every
seeded product, confirmed live), so the storefront needs a real
no-image fallback regardless of this bug, and gets exactly the same
"no image" case to build against either way.

### Unknown and inactive business slugs — verified LIVE this phase

**Indistinguishable, by design.** A slug that doesn't exist and a slug
belonging to a *suspended* business both return the exact same `404`
`{"detail": "No such business."}` — confirmed live by suspending
`acme-fashion`, hitting its product list (404, identical body), then
reactivating it. This is the same anti-enumeration pattern already
established elsewhere in this backend (a mismatched order id, a wrong
password) and this frontend should not try to tell the two cases apart
either — one "store not found" state covers both honestly.

### Other catalog endpoints (INSPECTED, not called live — staff/owner-only, no public use case)

| Endpoint | Methods | Who |
|---|---|---|
| `/api/<slug>/categories/` | POST, PATCH, DELETE | owner/manager write (GET is public, above) |
| `/api/<slug>/products/{id}/` | PATCH, DELETE | owner/manager write (GET is public, above) |
| `/api/<slug>/product-images/` | GET, POST, PATCH, DELETE | Member read; owner/manager write |
| `/api/<slug>/product-variants/` | GET, POST, PATCH, DELETE | Same split |

### No public business-detail endpoint — fixed (theming phase)

Was a confirmed gap through several phases: no anonymous-accessible
endpoint returned a `Business`'s own display name or currency by slug
(`businesses/platform_views.py::PlatformBusinessViewSet` is
`IsAdminUser`-only, `/api/me/businesses/` is authenticated and scoped to
the caller's own memberships, and there was nothing else in `businesses/`
at all).

**`GET /api/<slug>/store/` (`core.views.PublicStoreInfoView`, `AllowAny`)
now exists specifically to close this**, added alongside per-business
storefront theming: `{name, currency, theme}` — deliberately narrow (not
`Business.default_currency`/`contact_email`/etc., and not
`StoreSettings.default_delivery_fee`/`low_stock_default_threshold`
either), confirmed 404 on an unknown/suspended slug exactly like every
other public endpoint. `src/lib/api/store.ts`'s `getStoreInfo()` is the one
place this is called from; `src/lib/format.ts`'s `displayNameFromSlug()`
and digit-only `formatPrice()` are kept only as the fallback for a request
that can't reach this endpoint, not as the primary source anymore.

**`theme`** is `core/models.py::StoreSettings.Theme` — see
`src/lib/themes/registry.ts` for what each value actually changes in this
frontend, and the dashboard Settings page for where a business picks or
changes it (owner/manager only, same `PATCH /api/ops/<slug>/settings/`
currency and delivery fee already go through).

## Cart — inspected in depth this phase, not implemented (Step 6)

Not built in Phase 3 — these are the verified findings a cart
implementation phase needs, read directly from `cart/views.py`,
`cart/serializers.py`, `cart/models.py`, and `orders/views.py`.

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/api/<slug>/cart/` | GET | `IsAuthenticated` | The caller's own cart for **this** business only — `Cart` is unique per `(user, business)`, confirmed in `cart/models.py`'s own `UniqueConstraint`, so the same account can hold independent carts at two different stores. |
| `/api/<slug>/cart/items/` | GET, POST | `IsAuthenticated` | List / add. `POST` body: `{product: <id>, variant?: <id>, quantity: <int>}`. |
| `/api/<slug>/cart/items/{id}/` | PATCH, DELETE | `IsAuthenticated` | Update quantity / remove one line. |

**No anonymous/guest cart** — every cart endpoint requires a valid access
token; there is no session- or cookie-based cart identity for a
logged-out visitor anywhere in `cart/views.py`.

**Validation, from `CartItemSerializer.validate()`**: a variant must
belong to the product it's attached to (`"That variant does not belong to
this product."`, `400`), and the product must be `published`
(`"This product is not available."`, `400`) — stock is **not** checked at
add-to-cart time at all; `cart/models.py`'s own comment confirms pricing
and availability are display-only in the cart and re-validated for real
only at checkout (`orders/services.py::create_order_from_cart`). Adding
the same `(product, variant)` pair twice increments the existing line's
`quantity` server-side (`CartItemViewSet.perform_create`) rather than
creating a duplicate row — confirmed by reading the `unique_together`
constraint and the create logic together.

A fourth check, in `CartItemViewSet.perform_create` itself rather than the
serializer: the product (or its variant's product) must belong to **this
business** — `"That product is not sold by this business."`, `400`. The
view's own comment is explicit about why this exists even though a
storefront's own product picker would never offer another business's
product in the first place: it's the server-side backstop for a request
that didn't come from that picker.

**Quantity**: `CartItemSerializer.validate_quantity()` rejects anything
below `1` (`"Quantity must be at least 1."`, `400`). There is no
documented upper bound in the serializer itself — the real ceiling is
stock availability, enforced only at checkout, not in the cart.

**Persistence**: a `Cart` row is a normal authenticated-user-owned
database row, not a browser-local or session-only concept — it survives
across logins/devices for the same account, the same way orders and
addresses already do. There is nothing cart-specific for the BFF to do
beyond what Phase 2 already built (attach the access token); no new
cookie or storage mechanism is needed.

**Error responses for unavailable items**: handled identically to
checkout's own pattern — a `400` with `{"detail": "..."}` for
business-logic rejections (unpublished product, mismatched variant), and
DRF's standard `{"field": ["..."]}` shape for field-level validation
(e.g. `quantity`). No separate "out of stock" error exists at the cart
level, because stock isn't checked there at all — the first time
insufficient stock can actually surface is checkout.

`CartSerializer`: `{id, items: CartItem[], subtotal, updated_at}`.
`CartItemSerializer`: `{id, product, variant, product_name, quantity, unit_price}`.
A customer can hold **separate carts per business** — confirmed by the
backend's own test suite, not re-verified here since it needs auth.

## Checkout and orders (INSPECTED)

`POST /api/<slug>/checkout/` — body is **either** `{address_id}` **or**
`{delivery_recipient_name, delivery_line1, delivery_city, delivery_phone, delivery_line2?, contact_phone?}`.
Returns the created `Order` (`201`) or `{"detail": "..."}` (`400`) — e.g.
`"Your cart is empty."`, `"Only N of X left."`, `"X is no longer available."`

`GET /api/<slug>/orders/`, `/orders/{id}/`, `POST /orders/{id}/cancel/` — the
caller's own orders only; a mismatched id is `404`, never `403`.

Order shape: `{id, reference, status, currency, subtotal, delivery_fee, discount_total, tax_total, total, contact_email, contact_phone, delivery_*, items: OrderItem[], status_history: [...], created_at, updated_at}`.

## Payments (INSPECTED)

`POST /api/<slug>/payments/mpesa/initiate/` — body `{order_reference, phone}`.
`202` with the created `Payment` row, or `400`/`502` on failure. **No live
M-Pesa call has ever been made anywhere in this project** — this frontend
must not change that; Phase 2 should not wire a "pay" button to anything
beyond what the backend's own sandbox testing has separately verified.

## Business operations (INSPECTED — all require an active `BusinessMembership`)

| Endpoint | Role required | Notes |
|---|---|---|
| `/api/ops/<slug>/orders/`, `/orders/{id}/`, `POST .../transition/` | any member | staff included |
| `/api/ops/<slug>/payments/` | any member | read-only |
| `/api/ops/<slug>/customers/` | any member | `order_count`/`lifetime_total` scoped to **this** business only, even for a customer who also shops elsewhere |
| `/api/ops/<slug>/dashboard/` | any member | `{sales_total, orders_by_status, low_stock_count, recent_orders}` |
| `/api/ops/<slug>/settings/` | **owner/manager only** | `{currency, default_delivery_fee, low_stock_default_threshold}` |
| `/api/ops/<slug>/members/` | list: any member; create/update/delete: **owner only** |  |
| `/api/<slug>/inventory/` | read: any member; create/update/delete: owner/manager; `adjust`/`movements`: any member |  |
| `/api/ops/platform/businesses/` | **`is_staff` only** — not business roles at all | create/list/retrieve/activate/suspend |

## Error format — the whole shape, confirmed live for both cases

Every error response from this backend (`core/exceptions.py` +
DRF's own default handler, which the custom one wraps rather than
replaces) is one of exactly two shapes:

```json
{"detail": "A human-readable message."}
```
```json
{"field_name": ["Message one.", "Message two."], "another_field": ["..."]}
```
There is no third shape — an unhandled server error still returns
`{"detail": "Something went wrong on our side. Please try again."}` at
`500`, never a stack trace. `src/lib/api/client.ts`'s `ApiError` captures
the whole body so a caller can branch on either shape.

## Unresolved integration questions for Phase 2

1. **Token storage strategy isn't decided.** The backend hands back raw
   JWTs in the response body; it does not dictate how a frontend keeps
   them. The sibling `e-commerce` module in this same repo uses a BFF
   pattern (httpOnly cookies set by Next.js Route Handlers, browser never
   calls Django directly) — against a *different*, now-superseded
   single-tenant backend. This module has made **no** auth-storage
   decision yet; `API_BASE_URL` is deliberately server-only (not
   `NEXT_PUBLIC_`) specifically so that door stays open rather than being
   closed by default.
2. ~~How a real deployment picks a business slug isn't decided.~~
   **Resolved in Phase 3**: the slug is a URL path segment,
   `/store/<slug>/...`, read from the request itself — `DEFAULT_BUSINESS_SLUG`
   is gone, and nothing in this module hardcodes a business identity
   anywhere. A custom-domain-per-business scheme is still a door left open
   for later (would map a `Host` header to a slug upstream of this same
   route tree), but isn't needed for path-based storefront links to work
   today.
3. **Draft-product visibility for authenticated members** (`ProductViewSet`
   shows drafts to any business member) wasn't exercised live in this
   phase — no auth integration exists yet to test it with.

## Frontend-side findings, Phase 3 — not backend gaps, fixed in this module

Two real bugs turned up while building the storefront, both in this
module's own configuration, not in the backend. Noted here because they
cost real debugging time and the fix is non-obvious.

1. **`next.config.ts` couldn't see `API_BASE_URL` at all.** Next.js loads
   `.env.local` as part of starting its own runtime — `next.config.ts`
   itself runs *before* that, so `process.env.API_BASE_URL` was `undefined`
   every time the config module evaluated, silently collapsing
   `images.remotePatterns` to `[]`. The symptom was confusing: every real
   product image 404'd through `/_next/image` with `"url" parameter is not
   allowed`, which looks like a broken backend image, not a frontend config
   gap. Fixed with `@next/env`'s `loadEnvConfig` (Next's own documented
   answer for exactly this situation — ships inside the `next` package,
   now also a direct dependency here) called at the top of
   `next.config.ts`.
2. **Next 16 refuses to optimize an image from a loopback address by
   default** (SSRF hardening — logs `hostname resolved to private IP ...
   use images.dangerouslyAllowLocalIP`). Every local/rehearsal backend in
   this project's workflow runs on `localhost`, so this blocked every real
   image even after fix #1. `next.config.ts` now sets
   `images.dangerouslyAllowLocalIP` to `true` only when `API_BASE_URL`'s
   own hostname is actually a loopback address — a real deployment's
   `API_BASE_URL` is a public hostname, where this stays `false` and the
   SSRF guard keeps doing its job unmodified.

With both fixed, the storefront's own graceful-fallback behavior for a
product that has an image record but whose URL doesn't resolve (the
already-documented backend bug — `config/urls.py` never wires
`django.conf.urls.static.static(...)` for `MEDIA_ROOT`) was verified live:
`src/components/storefront/ProductImage.tsx` swaps in the same placeholder
used for a product with no image at all, rather than the browser's native
broken-image icon. Plain `onError` wasn't sufficient on its own — the
`<img>` is already present in server-rendered HTML, and a failure that
fast loses its `error` event to hydration timing (confirmed live); the
fix pairs `onError` with a mount-time check (`ref` + `useEffect` reading
`complete`/`naturalWidth`) for a failure that already happened before
React attached a listener.

## Known limitation — a cold request for a bad product id returns 200, not 404

`/store/[slug]` itself returns a true HTTP 404 for an unknown or
suspended business slug (`src/proxy.ts` checks before anything renders,
and rewrites to `src/app/store/unavailable/page.tsx`, a route with no
data dependency Next can resolve to a real 404 before it streams anything
— see that file's own comment and
`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`'s
"Calling `notFound()` before streaming starts returns a `404`").

`/store/[slug]/products/[id]` does **not** get the same treatment for a
wrong or foreign product id. Its data dependency is the id itself, which
`src/proxy.ts` deliberately does not also fetch — doing so would fetch
every product twice per request (once to decide routing, again to render
it) for a narrower case than an entire nonexistent store. Confirmed live:
this response's HTTP status is `200` even though the rendered content is
correctly the "Store not found" page — Cache Components mode locks the
response status once its Suspense fallback streams, before `notFound()`
resolves. A crawler sees a "soft 404" (Next still adds its own `noindex`
meta tag); a real visitor, or anything following a link inside this app
rather than hitting the URL cold, sees the correct page either way. A real
visitor never sees one business's product under another's slug, or wrong
content of any kind — only the status code is affected.
`tests/integration/storefront.test.ts` asserts on rendered content for
this case rather than status, with this same reasoning inline.

## Phase 4 — cart, checkout, orders, payments — verified LIVE end-to-end

Everything below was exercised against a real running backend (migrated,
`seed_catalog`), not just read from source: a fresh account registered
through `/api/auth/register/`, a variant product added to cart, checkout
with a manually-entered address, the resulting order's page, an M-Pesa
initiate call, and a self-cancel — each one driven by actually submitting
this module's own Server Action forms (captured from real rendered HTML,
replayed as the same `multipart/form-data` POST a browser's native
progressive-enhancement submit would send), not a mocked `fetch`.

- **`POST /api/auth/register/`** — confirmed live, same `{user, access,
  refresh}` shape as login; a duplicate email returns the backend's own
  `{"detail": "An account with that email already exists."}` unchanged
  through the BFF route.
- **Cart** (`cart.ts` / `cart/actions.ts`) — adding a variant product
  (`FA-001`, Size L) with `quantity=2` succeeded, and the cart page showed
  `Subtotal 3,600.00` (1,800.00 × 2) immediately after, via
  `revalidatePath`. No client JS was involved in this run — the same
  `$ACTION_*` form fields a browser embeds for progressive enhancement were
  replayed directly.
- **Checkout** (`orders.ts` / `checkout/actions.ts`) — with zero saved
  addresses, `CheckoutForm` defaults to `mode=manual` (confirmed in the
  rendered HTML) rather than showing an empty, unusable address dropdown.
  Submitting a manual address returned `303 See Other` to
  `/store/<slug>/orders/<id>` — `redirect()` called from inside a Server
  Action after a successful mutation does produce a real redirect response,
  not just client-side state. The cart was empty immediately after
  (`create_order_from_cart`'s own side effect).
- **Order total confirms an honest gap already on record**: the created
  order's total was `KES 3,600.00` — exactly the cart subtotal, because the
  seeded business's `StoreSettings.default_delivery_fee` is `0` by default
  and nothing in this phase changed that. The checkout page's own copy
  ("a delivery fee set by the store is added automatically") is accurate
  but this run didn't exercise a nonzero fee — still no public endpoint
  exposes that number ahead of checkout, unchanged from Phase 3's finding.
- **M-Pesa initiate** (`payments.ts`) — with `MPESA_ENABLED=False` (this
  environment's default, unchanged), the real backend response
  `{"detail": "M-Pesa is not configured on this server."}` round-tripped
  through `initiatePaymentAction` and rendered inline on the order page,
  exactly as a real misconfiguration would — confirming the error path
  works without ever attempting a live push (none was attempted or
  possible here).
- **Self-cancel** (`cancelOrderAction`) — moved the order from
  `awaiting_payment` to `cancelled`; the order page's own conditional
  rendering (payable/cancellable status sets) correctly hid both the
  M-Pesa form and the cancel button on the next load, and the status
  history list grew by one entry.
- **The proxy's new account-required paths were confirmed with no session
  cookie at all**: `/cart`, `/checkout`, `/orders`, and `/orders/<id>` all
  `307` to `/login?next=<the original path>`; a product page
  (`/products/<id>`) still `200`s anonymously; an unknown slug still `404`s.
  This is the one property this phase added to `proxy.ts` and is the one
  most likely to regress silently if a future route gets added under
  `/store/[slug]/` without updating `requiresAccountIn()`.

**Known, accepted limitation carried into this phase, not fixed**: a
product with more than one variant dimension (e.g. Size *and* Color) has no
single `ProductVariant` row representing a chosen combination of both
(`cart/models.py`'s `CartItem.variant` is a single FK) — `ProductBuyBox`
shows the pickers but disables "Add to cart" with an explanatory message
rather than guessing which row to submit. Not exercised live this phase (no
seeded product has more than one variant dimension); covered by reasoning
inline in `ProductBuyBox.tsx`, not by a live multi-dimension test case.
