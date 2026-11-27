# Velora frontend

React + TypeScript + Vite app for Velora, the bookings and appointments platform. The API lives in
`genmarstech/softwares` under `velora/`.

```bash
cp .env.example .env     # VITE_API_URL (Django API) and VITE_SITE_URL (public address, see below)
npm install
npm run dev              # http://localhost:5173
npm run build            # type-check and production build
npm run lint
```

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/`, `/features`, `/solutions`, `/how-it-works`, `/about` | Everyone | Public site, one page each (old `/#features` style links redirect) |
| `/terms`, `/privacy` | Everyone | Plain-language legal pages (draft, have them reviewed before launch) |
| `/login`, `/register` | Everyone | Accounts |
| `/onboarding/business` | Owner | Business profile, services, team (owner is added as staff if the team is left empty) |
| `/businesses` | Owner | Pick a business workspace |
| `/dashboard/:id/overview` | Owner | Today's schedule, bookings needing attention, services and team |
| `/dashboard/:id/bookings` | Owner | List and day calendar, new bookings, walk-ins, confirm, check in, complete, no-show, reschedule, cancel, payments, history |
| `/dashboard/:id/customers` | Owner | Customer list, history and message opt-outs |
| `/dashboard/:id/services` | Owner | Prices, durations, prep/cleanup buffers, deposits, rooms |
| `/dashboard/:id/team` | Owner | Staff, the services they do, their own working hours |
| `/dashboard/:id/schedule` | Owner | Opening hours, breaks, time off, waitlist, rooms, locations |
| `/dashboard/:id/notifications` | Owner | Delivery log with retry |
| `/dashboard/:id/analytics` | Owner | Funnel, attendance, capacity, revenue, retention, CSV export, print to PDF |
| `/dashboard/:id/settings` | Owner | Booking rules, deposits, reminders, quiet hours, business profile |
| `/book/:id` | Customers | Public booking page (`?source=instagram` tracks where bookings come from) |
| `/manage/:token` | Customers | Confirm, reschedule or cancel through the private link in every message |

## Brand and site address

Logo, colours, illustrations and the writing voice are described in [BRAND.md](BRAND.md).

The public address is set with `VITE_SITE_URL` (default `https://getvelora.co.ke`, not final). At build
time it fills in the canonical link and link-preview tags in `index.html`, and writes `robots.txt` and
`sitemap.xml` (see `vite.config.ts`). Changing domain is that one setting.

## CSRF

`src/lib/api/axios.ts` fetches a CSRF token at start-up and attaches `X-CSRFToken` to every POST, PATCH
and DELETE. If Django rejects a token, it refreshes it and retries once. Call the API through
`backendClient`; do not read the cookie by hand.

## Styling

Pages keep the existing look: cream background (`#f8f7f2`), deep green text and buttons, sage accents,
DM Sans with Playfair Display headings. Shared dashboard styles are in `src/styles/dashboard.css`;
the customer pages use `src/styles/booking.css`.

- App-wide basics (box sizing, body colour, the full-page loading screen) live in `src/index.css`.
- Fonts are loaded once from `index.html`.
- Pages are code-split, but every stylesheet is imported up front in `src/main.tsx` in a fixed order.
  Some pages share class names (for example `.velora-logo`), so keep that order when adding a stylesheet.
- Shared building blocks are in `src/components/ui.tsx`: `Modal` (Escape, focus kept inside, page scroll
  locked), `Spinner`, `PageLoading`, `EmptyState`, `Alert`, `Field`, `PageHeader` and `Section`.
- Use `BOOKING_CHANNEL_LABELS` and `humanize()` from `src/lib/format.ts` rather than showing raw API values.
