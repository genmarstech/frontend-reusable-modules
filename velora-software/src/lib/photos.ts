/**
 * Photography slots. Every photo must be original or carry a licence that allows
 * commercial use (nappy.co, Unsplash, Pexels), be saved in /public/images as an
 * optimised WebP, and be credited in public/images/CREDITS.md.
 *
 * A slot left as null shows Velora's own illustration instead, so nothing looks broken.
 */
export const PHOTOS = {
    /** Dashboard promo card: a calm spa or salon portrait, portrait crop (about 3:4). */
    dashboardPromo: "/images/promo/grow-business.webp" as string | null,
    /** Marketing hero props beside the product screenshot (plant, towel, bottle), transparent or cream background. */
    heroProps: null as string | null,
    /** Screenshot of the real dashboard (demo data), shown in the home page hero. */
    product: "/images/product/dashboard-overview.webp",
    /** Service thumbnails on the dashboard, by slot name (see SERVICE_KEYWORDS). */
    services: Object.fromEntries(
        ["hair-styling", "facial", "haircut", "nails", "braids", "barbering", "massage", "makeup"].map((slot) => [
            slot,
            `/images/services/${slot}.webp`,
        ])
    ) as Record<string, string>,
    /** Solutions page, one per business type. A missing one falls back to an illustration. */
    solutions: {
        "beauty-salons": null,
        barbershops: "/images/marketing/solutions-barbershops.webp",
        "spas-and-wellness": "/images/marketing/solutions-spas.webp",
        "beauty-clinics": "/images/marketing/solutions-clinics.webp",
        "independent-professionals": null,
    } as Record<string, string | null>,
    /** Features page, one per feature section (by slug). */
    features: Object.fromEntries(
        ["online-booking", "client-records", "team-and-schedule", "reminders-and-insights"].map((slug) => [
            slug,
            `/images/marketing/features-${slug.replace("-and-", "-")}.webp`,
        ])
    ) as Record<string, string | null>,
    aboutStudio: "/images/marketing/about-studio.webp" as string | null,
};

/** Keywords in a service name -> the photo slot that suits it. */
const SERVICE_KEYWORDS: [RegExp, string][] = [
    [/hair ?styl|blow|wash|treatment/, "hair-styling"],
    [/facial|skin|peel/, "facial"],
    [/haircut|trim|cut/, "haircut"],
    [/nail|manicure|pedicure|gel/, "nails"],
    [/braid|cornrow|locs|weave/, "braids"],
    [/barber|shave|fade|beard/, "barbering"],
    [/massage|spa/, "massage"],
    [/make-?up|brow|lash/, "makeup"],
];

export function servicePhoto(name: string): string | null {
    const lower = name.toLowerCase();
    const slot = SERVICE_KEYWORDS.find(([re]) => re.test(lower))?.[1];
    return slot ? PHOTOS.services[slot] || null : null;
}
