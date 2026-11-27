# Prime Field Agriculture: website

The approved redesign: 9 pages plus one page per product, green and gold
brand. It is a static export (`output: "export"`), so `npm run build` writes
plain HTML to `out/`, which any static host can serve.

```bash
npm install
npm run dev      # http://localhost:3030
npm run verify   # typecheck and build; run before pushing
```

## Where things are

- `src/app/globals.css` is the approved design's stylesheet, copied over
  unchanged apart from the font variables. It was kept as CSS, not rewritten
  in Tailwind, so the site cannot drift from what the client signed off.
- `src/app/enhance.css` is everything added since sign-off: phone layout
  (swipeable product rows, two-column catalogue, sticky filters) and
  motion. All motion switches off for visitors who ask for reduced motion.
- `src/components/Motion.tsx` drives the scroll reveals, the header's
  scrolled state and the back-to-top button.
- `src/lib/products.ts` holds the 20 products. Each one gets a page at
  `/products/<id>/` at build time. Photos are `public/img/products/<id>.jpg`.
- `src/lib/site.ts` holds phone numbers, emails, hours and addresses.
- `src/lib/quote.ts` is the "add to quote" list, kept in the visitor's
  browser only.
- `src/lib/quoteRequest.ts` is how a quote leaves the site: it opens the
  buyer's WhatsApp or email app with the request written out. If a backend
  is added, this is the only file the form depends on that has to change.

## Before launch: needs the client

Search the code for `UNCONFIRMED` to find each of these.

- HS codes and packing sizes for all 20 products (`src/lib/products.ts`)
- Minimum order, terms and ports on the product pages
- The quality checks (`src/app/quality/page.tsx`)
- The FAQ answers (`src/app/faqs/page.tsx`)
- The privacy policy, a template that needs legal review. It mentions
  cookies and analytics, and the site sets neither today.
- Licences for some client photos that look like stock images (`CREDITS.md`)
