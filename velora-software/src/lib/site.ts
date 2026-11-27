/**
 * Brand and site settings in one place.
 *
 * The public address is not final yet (getvelora.co.ke is the likely one), so it comes from
 * VITE_SITE_URL at build time. Set it in `.env.local` or the hosting environment.
 */
export const SITE = {
    name: "Velora",
    tagline: "Bookings & appointments",
    description:
        "Velora helps salons, barbershops, spas and beauty professionals in Kenya take bookings online, send reminders and run their day from one calm dashboard.",
    url: (import.meta.env.VITE_SITE_URL || "https://getvelora.co.ke").replace(/\/+$/, ""),
    /** Shown on the legal pages. Leave VITE_CONTACT_EMAIL unset until the mailbox exists. */
    contactEmail: (import.meta.env.VITE_CONTACT_EMAIL || "") as string,
} as const;

/** "Features · Velora". The home page passes nothing and gets the full name. */
export function pageTitle(title?: string): string {
    return title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`;
}
