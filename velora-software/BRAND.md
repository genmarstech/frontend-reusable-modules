# Velora brand

Velora is a calm, capable front desk for salons, barbershops, spas and beauty professionals in Kenya.
The brand builds on the cream and green look the app already had. Improve it, don't redesign it.

## Logo

- **Mark**: two leaves opening into a "V" around a single bud, on a deep green tile. A business in
  bloom, and a person being looked after. Source: `public/favicon.svg` and `<LogoMark />` in
  `src/components/Brand.tsx` (keep the two in sync).
- **Wordmark**: `velora.` in Playfair Display Bold, lowercase, with the full stop in sage.
- Use `<Logo />` (mark + wordmark) inside the page's logo link. Use the mark alone where space is tight
  (favicon, app icon, loading screen, "Powered by").
- On dark green backgrounds the tile gets a faint light edge (see `src/styles/brand.css`).
- Don't recolour, stretch or outline the mark, and don't set the wordmark in another font.

## Colours

| Role | Hex |
| --- | --- |
| Cream (page background) | `#f8f7f2` |
| Ink (headings, text) | `#202b26` |
| Deep green (mark, buttons, CTA band) | `#3e5948` / `#354c3d` |
| Sage (accents, italics) | `#627c69` |
| Light sage (mark leaf, accents on dark) | `#a8bea9` |
| Mist (soft fills) | `#edf2ec` |
| Sand (warm accent in illustrations) | `#efe6d6` |

## Type

- **Playfair Display** for headings and the wordmark. Italic sage for the second half of a headline
  ("Beautifully managed. *Effortlessly organised.*").
- **DM Sans** for everything else.

## Illustrations

`src/components/Illustrations.tsx` holds original line illustrations drawn in SVG: a soft mist blob
behind, white shapes with a deep green 2.5px outline, sage and sand fills, and a small leaf sprig taken
from the logo. They are decorative by default (`aria-hidden`); pass `title` when the picture carries
meaning. Add new ones in the same style rather than using stock art. No hotlinked images.

## Icons and images

| File | Use |
| --- | --- |
| `public/favicon.svg`, `public/favicon.ico` | Browser tab |
| `public/apple-touch-icon.png` | iPhone home screen (square, iOS rounds it) |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Android / installed app (`site.webmanifest`) |
| `public/og-image.png` | Link previews on WhatsApp, Facebook, X, LinkedIn (1200×630) |
| `public/brand/email-logo.png` | Top of emails to businesses (the backend links to it) |

## Voice

Warm, plain and sure of itself, like a good receptionist.

- Talk to the owner as "you" and about "your clients". Short sentences. No jargon ("leverage", "solution").
- Only promise what the product does today. SMS and WhatsApp reminders are not live yet, so public copy
  says "reminders", not "SMS reminders".
- British spelling, as used in Kenya: organised, cancelled, colour.
- Local by default: prices in KES, Kenyan names in examples (Wanjiru, Amina, Njeri), WhatsApp first.
- Buttons say what happens: "Get started", "Log in", "Log out", "Manage your booking".
- Errors are calm and helpful: what happened, then what to do next. Never blame the user.
- Page titles read `Page · Velora`; in the dashboard `Page · Business · Velora`.
