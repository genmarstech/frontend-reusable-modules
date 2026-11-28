/** Which set of decorative motifs a business's booking page uses. */
export type ArtTheme = "spa" | "barber" | "salon" | "clinic" | "beauty";

/** Map a business category code (SC, BSC, SP, BCC, SPC) to an art theme. */
export function artThemeFor(category?: string | null): ArtTheme {
    switch (category) {
        case "SP": return "spa";
        case "BSC": return "barber";
        case "BCC": return "clinic";
        case "SPC": return "beauty";
        default: return "salon";
    }
}
