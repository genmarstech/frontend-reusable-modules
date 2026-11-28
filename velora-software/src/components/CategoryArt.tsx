/**
 * Decorative line art for the public booking page, drawn here in SVG
 * (original artwork, no external assets). Each business category gets its own
 * set of motifs: spa stones and lotus, barber pole and razor, salon dryer and
 * comb, clinic serums, nail polish and lipstick. Warm colours (gold, apricot,
 * blush, clay) sit on Velora's green and cream. Everything here is purely
 * decorative and hidden from screen readers.
 */
import type { CSSProperties, ReactNode } from "react";
import type { ArtTheme } from "../lib/artTheme";

type Tone = "gold" | "apricot" | "blush" | "clay" | "sage";

/* ---------- Motifs, each drawn in a 48 x 48 box ---------- */

const MOTIFS: Record<string, (fill: string) => ReactNode> = {
    // Spa
    lotus: (f) => (
        <>
            <path d="M24 10c6 7 7 16 0 24-7-8-6-17 0-24Z" fill={f} />
            <path d="M24 34c-9 0-15-6-17-14 8 0 14 5 17 14Z" />
            <path d="M24 34c9 0 15-6 17-14-8 0-14 5-17 14Z" />
            <path d="M23 35c-9 2-17 0-21-6 7-2 14 0 21 6ZM25 35c9 2 17 0 21-6-7-2-14 0-21 6Z" />
            <path d="M12 41h24" />
        </>
    ),
    stones: (f) => (
        <>
            <ellipse cx="24" cy="39" rx="15" ry="5" />
            <ellipse cx="24" cy="29.5" rx="11" ry="4.5" fill={f} />
            <ellipse cx="24" cy="21" rx="7.5" ry="3.8" />
            <ellipse cx="24" cy="13.6" rx="4.5" ry="2.8" fill={f} />
            <path d="M30 7c2-2 5-2 7 0" />
        </>
    ),
    candle: (f) => (
        <>
            <rect x="15" y="23" width="18" height="19" rx="2.5" />
            <path d="M15 28c3 2 5-1 7 1s4 3 6 0 4-1 5 0" />
            <path d="M24 23v-4" />
            <path d="M24 5c4.5 5 5.5 9.5 0 13-5.5-3.5-4.5-8 0-13Z" fill={f} />
            <path d="M10 44h28" />
        </>
    ),
    leaf: (f) => (
        <>
            <path d="M9 42C14 26 24 14 40 7" />
            <path d="M40 7c-1 13-9 21-21 22 1-12 9-20 21-22Z" fill={f} />
            <path d="M20 30c-8-1-12-6-12-13 7 1 12 6 12 13Z" />
        </>
    ),
    steam: () => (
        <>
            <path d="M16 40c-4-5 4-8 0-13s4-8 0-13" />
            <path d="M24 42c-4-5 4-8 0-13s4-8 0-13-4-7 0-11" />
            <path d="M32 40c-4-5 4-8 0-13s4-8 0-13" />
        </>
    ),
    // Barber
    scissors: (f) => (
        <>
            <circle cx="14" cy="37" r="6" />
            <circle cx="34" cy="37" r="6" fill={f} />
            <path d="M18 32L36 5M30 32L12 5" />
            <circle cx="24" cy="19.5" r="1.2" />
        </>
    ),
    comb: () => (
        <>
            <rect x="5" y="14" width="38" height="8" rx="3" />
            <path d="M9 22v11M13 22v13M17 22v13M21 22v13M25 22v13M29 22v13M33 22v13M37 22v13M41 22v9" />
        </>
    ),
    razor: (f) => (
        <>
            <path d="M6 41l17-17" strokeWidth="4" />
            <path d="M23 24l12-13c3-3 8 1 5 5L28 29Z" fill={f} />
            <circle cx="25.5" cy="26.5" r="1.2" />
        </>
    ),
    pole: (f) => (
        <>
            <rect x="15" y="4" width="18" height="5" rx="2.5" fill={f} />
            <rect x="15" y="39" width="18" height="5" rx="2.5" fill={f} />
            <rect x="18" y="9" width="12" height="30" rx="2" />
            <path d="M18 17l12-7M18 25l12-7M18 33l12-7M20 39l10-6" />
        </>
    ),
    brushShave: (f) => (
        <>
            <path d="M16 27c-3-10 2-20 8-23 6 3 11 13 8 23Z" fill={f} />
            <rect x="17" y="27" width="14" height="4" rx="1.5" />
            <path d="M19 31l-1 11h12l-1-11" />
        </>
    ),
    // Salon
    dryer: (f) => (
        <>
            <path d="M8 12h21a9 9 0 0 1 0 18H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" />
            <circle cx="29" cy="21" r="4" fill={f} />
            <path d="M15 30l-2.5 13h7L22 30" />
            <path d="M41 16h5M42 21h6M41 26h5" />
        </>
    ),
    mirror: (f) => (
        <>
            <circle cx="24" cy="18" r="13" />
            <circle cx="24" cy="18" r="9" fill={f} />
            <path d="M18 14c1.5-3 4-4.5 7-5" />
            <path d="M24 31v13M20 44h8" />
        </>
    ),
    curl: () => (
        <>
            <path d="M8 44c0-16 14-15 14-28 0-6 4-11 10-11 6 0 9 5 7 10" />
            <path d="M15 44c0-12 14-13 14-25" />
            <path d="M22 44c0-8 12-10 13-19" />
        </>
    ),
    roundBrush: (f) => (
        <>
            <path d="M5 43l14-14" strokeWidth="4" />
            <rect x="19" y="9" width="12" height="24" rx="6" transform="rotate(45 25 21)" fill={f} />
            <path d="M18 20l-4-4M22 16l-4-4M26 12l-4-4M30 30l4 4M34 26l4 4M38 22l4 4" />
        </>
    ),
    // Clinic
    dropper: (f) => (
        <>
            <path d="M20 13V9a4 4 0 0 1 8 0v4" fill={f} />
            <rect x="18" y="13" width="12" height="6" rx="1.5" />
            <rect x="13" y="19" width="22" height="24" rx="5" />
            <path d="M18 29h12M18 34h8" />
        </>
    ),
    jar: (f) => (
        <>
            <rect x="9" y="12" width="30" height="8" rx="2.5" fill={f} />
            <path d="M11 20h26v17a6 6 0 0 1-6 6H17a6 6 0 0 1-6-6Z" />
            <path d="M17 29h14" />
        </>
    ),
    drop: (f) => (
        <>
            <path d="M24 5c7 10 12 17 12 25a12 12 0 0 1-24 0c0-8 5-15 12-25Z" fill={f} />
            <path d="M18 31c0 4 2 6 5 7" />
        </>
    ),
    // Beauty professional: nails and make-up
    polish: (f) => (
        <>
            <rect x="19" y="3" width="10" height="16" rx="2" />
            <rect x="17" y="19" width="14" height="4" rx="1" />
            <path d="M15 23h18a5 5 0 0 1 5 5v9a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7v-9a5 5 0 0 1 5-5Z" fill={f} />
            <path d="M15 30c0-2 1-3 3-3" />
        </>
    ),
    lipstick: (f) => (
        <>
            <rect x="15" y="29" width="18" height="15" rx="2.5" />
            <rect x="17" y="21" width="14" height="8" rx="1" />
            <path d="M19 21v-9l10-7v16" fill={f} />
        </>
    ),
    makeupBrush: (f) => (
        <>
            <path d="M5 43l15-15" strokeWidth="3.5" />
            <path d="M20 28l-3-3 4-4 3 3Z" />
            <path d="M24 24l-3-3c4-6 12-14 22-16-2 10-10 18-16 22Z" fill={f} />
        </>
    ),
    compact: (f) => (
        <>
            <circle cx="24" cy="24" r="17" />
            <circle cx="24" cy="24" r="12" fill={f} />
            <path d="M17 21c1-3 4-5 7-5" />
        </>
    ),
    // Shared
    sparkle: (f) => <path d="M24 6c1.4 11 4 14.6 15 16-11 1.4-13.6 4-15 15-1.4-11-4-13.6-15-15 11-1.4 13.6-5 15-16Z" fill={f} />,
};

const THEME_MOTIFS: Record<ArtTheme, { hero: string; side: [string, string, string]; set: string[] }> = {
    spa: { hero: "lotus", side: ["stones", "candle", "leaf"], set: ["lotus", "stones", "candle", "leaf", "steam"] },
    barber: { hero: "scissors", side: ["pole", "razor", "comb"], set: ["scissors", "pole", "razor", "comb", "brushShave"] },
    salon: { hero: "dryer", side: ["mirror", "scissors", "curl"], set: ["dryer", "comb", "mirror", "curl", "roundBrush"] },
    clinic: { hero: "dropper", side: ["jar", "drop", "leaf"], set: ["dropper", "jar", "drop", "leaf", "sparkle"] },
    beauty: { hero: "polish", side: ["lipstick", "makeupBrush", "compact"], set: ["polish", "lipstick", "makeupBrush", "compact", "sparkle"] },
};

function Motif({ name, x, y, size, rotate = 0, tone, fillOpacity = 0.22 }: {
    name: string; x: number; y: number; size: number; rotate?: number; tone: Tone; fillOpacity?: number;
}) {
    const s = size / 48;
    const draw = MOTIFS[name];
    if (!draw) return null;
    return (
        <g
            className={`cat-tone-${tone}`}
            transform={`translate(${x} ${y}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${s})`}
            style={{ ["--cat-fill-opacity" as string]: fillOpacity } as CSSProperties}
        >
            {draw("currentColor")}
        </g>
    );
}

/** Small four-point stars and dots that fill gaps between the motifs. */
function Twinkles({ points, tone }: { points: [number, number, number][]; tone: Tone }) {
    return (
        <g className={`cat-tone-${tone} cat-twinkles`}>
            {points.map(([x, y, r], i) =>
                r > 0 ? (
                    <Motif key={i} name="sparkle" x={x - r} y={y - r} size={r * 2} tone={tone} fillOpacity={0.9} />
                ) : (
                    <circle key={i} cx={x} cy={y} r={-r} className="cat-dot" />
                ),
            )}
        </g>
    );
}

/**
 * The large composition that sits in the green header: a warm sun disc and
 * arch behind the category's main motif, flanked by smaller ones.
 */
export function BookingHeroArt({ theme, className = "" }: { theme: ArtTheme; className?: string }) {
    const t = THEME_MOTIFS[theme];
    return (
        <svg fill="none" className={`cat-art cat-hero-art ${className}`} viewBox="0 0 420 260" aria-hidden="true" focusable="false">
            <circle cx="214" cy="128" r="104" className="cat-sun" />
            <path d="M120 236V132a94 94 0 0 1 188 0v104" className="cat-arch" />
            <path d="M92 236V132a122 122 0 0 1 244 0v104" className="cat-arch cat-arch-dash" />
            <path d="M60 236h300" className="cat-ground" />
            <Motif name={t.hero} x={148} y={70} size={132} tone="gold" fillOpacity={0.28} />
            <Motif name={t.side[0]} x={36} y={140} size={78} rotate={-8} tone="apricot" />
            <Motif name={t.side[1]} x={312} y={136} size={80} rotate={8} tone="blush" />
            <Motif name={t.side[2]} x={330} y={34} size={54} rotate={14} tone="gold" />
            <Motif name="leaf" x={40} y={36} size={56} rotate={-30} tone="sage" fillOpacity={0.3} />
            <Twinkles tone="gold" points={[[126, 52, 9], [300, 76, 6], [96, 118, 4], [258, 30, 5], [24, 112, -2.2], [394, 118, -2.2], [178, 22, -2], [372, 218, -2]]} />
        </svg>
    );
}

/**
 * A repeating wallpaper of the category's motifs for the cream page behind
 * the booking card. Fades out toward the middle so the card stays the focus.
 */
export function BookingPatternArt({ theme, className = "" }: { theme: ArtTheme; className?: string }) {
    const set = THEME_MOTIFS[theme].set;
    const id = `cat-pattern-${theme}`;
    const tones: Tone[] = ["clay", "apricot", "gold", "blush", "clay"];
    const spots: [number, number, number, number][] = [
        [18, 22, 46, -12], [150, 12, 40, 16], [86, 104, 50, 8], [206, 120, 42, -18], [14, 188, 40, 20],
    ];
    return (
        <svg fill="none" className={`cat-art cat-pattern-art ${className}`} aria-hidden="true" focusable="false">
            <defs>
                <pattern id={id} width="260" height="260" patternUnits="userSpaceOnUse">
                    {spots.map(([x, y, size, rot], i) => (
                        <Motif key={i} name={set[i % set.length]} x={x} y={y} size={size} rotate={rot} tone={tones[i]} fillOpacity={0.18} />
                    ))}
                    <Twinkles tone="gold" points={[[132, 82, 6], [244, 64, -2], [70, 176, -2], [180, 214, 7], [120, 246, -1.6], [236, 196, -1.6]]} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
    );
}

/** A thin ornamental divider with three motifs, for the foot of the card. */
export function BookingOrnament({ theme, className = "" }: { theme: ArtTheme; className?: string }) {
    const t = THEME_MOTIFS[theme];
    return (
        <svg fill="none" className={`cat-art cat-ornament ${className}`} viewBox="0 0 320 40" aria-hidden="true" focusable="false">
            <path d="M8 20h104M208 20h104" className="cat-rule" />
            <circle cx="8" cy="20" r="2" className="cat-dot" />
            <circle cx="312" cy="20" r="2" className="cat-dot" />
            <Motif name={t.side[0]} x={118} y={6} size={28} tone="apricot" />
            <Motif name={t.hero} x={146} y={2} size={36} tone="clay" fillOpacity={0.25} />
            <Motif name={t.side[1]} x={182} y={6} size={28} tone="gold" />
        </svg>
    );
}
