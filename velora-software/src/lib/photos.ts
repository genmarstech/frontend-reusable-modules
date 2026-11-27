/**
 * Photography slots. Every photo must be original or carry a licence that allows
 * commercial use (nappy.co, Unsplash, Pexels), be saved in /public/photos as an
 * optimised WebP, and be credited in velora-software/CREDITS.md.
 *
 * A slot left as null shows Velora's own illustration instead, so nothing looks broken.
 */
export const PHOTOS = {
    /** Dashboard promo card: a calm spa or salon portrait, portrait crop (about 3:4). */
    dashboardPromo: null as string | null,
    /** Marketing hero props beside the product screenshot (plant, towel, bottle), transparent or cream background. */
    heroProps: null as string | null,
    /** Service thumbnails on the dashboard, by a lower-case keyword found in the service name. */
    services: {} as Record<string, string>,
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
