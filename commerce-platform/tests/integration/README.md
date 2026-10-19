# Integration tests — prerequisites

These make real HTTP requests to a running instance of this app, which
itself calls a running backend. They are not run as part of `npm run
build` or CI by default — they need two servers up first.

## What this review actually ran

1. Backend: `e-commerce-backend`, migrated, with two test users, each a
   member of a DIFFERENT business (dashboard.test.ts's isolation check
   needs both):
   ```python
   from accounts.models import User
   from businesses.models import Business, BusinessMembership
   from businesses.services import create_business

   user_a = User.objects.create_user(email="login-check@example.com", password="a-strong-passw0rd!")
   BusinessMembership.objects.create(
       business=Business.objects.get(slug="genmars-store"), user=user_a, role="owner"
   )

   user_b = User.objects.create_user(email="login-check-2@example.com", password="a-strong-passw0rd!")
   acme = create_business(name="Acme Fashion", slug="acme-fashion")
   BusinessMembership.objects.create(business=acme, user=user_b, role="staff")
   ```
2. **Phase 3 (`storefront.test.ts`) additionally needs**: `genmars-store`
   seeded with `manage.py seed_catalog` (gives it a published "Men's
   Classic Fit Shirt" among other products), and `acme-fashion` — the same
   business created above — given at least one of its own published
   products, also named "Men's Classic Fit Shirt" but with a different
   SKU, e.g.:
   ```python
   from catalog.models import Product

   Product.objects.create(
       business=acme, name="Men's Classic Fit Shirt", sku="ACME-SHIRT-1",
       price="1800.00", status=Product.Status.PUBLISHED,
   )
   ```
   The two products' ids are looked up by this test file itself (a direct
   `GET /api/<slug>/products/?search=...` against the backend, not
   hardcoded — see its own `findProductId` helper), so the exact
   autoincrement values don't matter; only that each business has
   *exactly one* product matching that search.
3. Backend dev server on `http://localhost:8010` (`manage.py runserver 8010`).
4. This app's `.env.local` pointing `API_BASE_URL` at that backend.
5. This app's dev server on `http://localhost:3040` (`npm run dev -- -p 3040`)
   — `storefront.test.ts`'s HTTP-status assertions (a real `404` for an
   unknown store slug) only hold against a **production build**
   (`npm run build && npm run start -- -p 3040`); Next's dev server adds
   its own overlay/HMR scaffolding that doesn't change status codes, so
   either works, but this review's own run used a production build.
6. `npm run test:integration` from this directory.

## Running them yourself

```bash
export TEST_BASE_URL=http://localhost:3040         # default if unset
export TEST_BACKEND_URL=http://localhost:8010       # default if unset — storefront.test.ts only
export TEST_USER_EMAIL=login-check@example.com      # default if unset
export TEST_USER_PASSWORD='a-strong-passw0rd!'      # default if unset
export TEST_USER_2_EMAIL=login-check-2@example.com  # default if unset
export TEST_USER_2_PASSWORD='a-strong-passw0rd!'    # default if unset
npm run test:integration
```

If a test user doesn't exist on whatever backend `API_BASE_URL` points
at, every test using it fails immediately with a clear message naming the
missing user — not a confusing connection or assertion error. Same for
`storefront.test.ts`: a missing product fixture fails with a message
naming the business and search term, not a bare 404 or a confusing empty
assertion.
