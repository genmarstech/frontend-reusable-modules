# Velora frontend

React + TypeScript + Vite app for Velora, the bookings and appointments platform. The API lives in
`genmarstech/softwares` under `velora/`.

```bash
cp .env.example .env     # VITE_API_URL points at the Django API (default http://localhost:8000/)
npm install
npm run dev              # http://localhost:5173
npm run build            # type-check and production build
npm run lint
```

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/`, `/login`, `/register` | Everyone | Landing page and accounts |
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

## CSRF

`src/lib/api/axios.ts` fetches a CSRF token at start-up and attaches `X-CSRFToken` to every POST, PATCH
and DELETE. If Django rejects a token, it refreshes it and retries once. Call the API through
`backendClient`; do not read the cookie by hand.

## Styling

Pages keep the existing look: cream background (`#f8f7f2`), deep green text and buttons, sage accents,
DM Sans with Playfair Display headings. Shared dashboard styles are in `src/styles/dashboard.css`;
the customer pages use `src/styles/booking.css`.
