/**
 * Decorative botanical artwork (original, drawn here in SVG) for cards that
 * have room for a little softness: the setup checklist, the help card and the
 * promo card when no photo is set. Hidden from screen readers.
 */

/** A tall spray of leaves, drawn in currentColor at low opacity. */
export function LeafSpray({ className = "" }: { className?: string }) {
    return (
        <svg className={`v-leaf-spray ${className}`} viewBox="0 0 120 200" aria-hidden="true" focusable="false">
            <g fill="currentColor">
                <path d="M62 200C60 150 64 96 84 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M84 40c6-20 20-32 34-38-2 22-14 36-34 38Z" />
                <path d="M78 66c-18-6-30-20-32-40 20 4 32 18 32 40Z" opacity=".8" />
                <path d="M74 88c10-16 26-24 44-24-6 18-22 26-44 24Z" />
                <path d="M68 116c-20-2-36-14-42-34 22 0 38 12 42 34Z" opacity=".8" />
                <path d="M66 140c10-18 28-26 48-26-6 20-26 30-48 26Z" />
                <path d="M62 166c-20 0-38-10-46-30 22-2 40 8 46 30Z" opacity=".8" />
            </g>
        </svg>
    );
}

/** A small bud between two leaves, like the logo mark, for the help card. */
export function BudSprig() {
    return (
        <svg className="v-bud-sprig" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path d="M24 44V22" stroke="#3e5948" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 34c-9 0-15-6-16-14 9 0 15 5 16 14Z" fill="#a8bea9" />
            <path d="M24 30c8-1 13-7 13-14-8 1-13 6-13 14Z" fill="#627c69" />
            <path d="M24 22c-4-3-5-8-3-13 2 2 3 2 3 2s1 0 3-2c2 5 1 10-3 13Z" fill="#e0b86a" />
        </svg>
    );
}

/**
 * Stand-in for the promo photo: an original illustration of a woman relaxing
 * with eyes closed, in robe and head wrap, framed by leaves. Brand colours only.
 */
export function RelaxArt() {
    return (
        <svg className="v-relax-art" viewBox="0 0 220 260" aria-hidden="true" focusable="false">
            <circle cx="132" cy="112" r="92" fill="#4c6a55" />
            <g fill="#6f8c75" opacity=".7">
                <path d="M22 250c4-52 22-92 54-118-4 46-22 86-54 118Z" />
                <path d="M30 196c-14-26-14-52 0-78 14 26 14 52 0 78Z" />
            </g>
            {/* robe */}
            <path d="M58 260c4-50 30-82 76-86 46 4 74 36 80 86Z" fill="#f4efe4" />
            <path d="M134 176l-18 84M134 176l20 84" stroke="#d9cfbd" strokeWidth="3" fill="none" />
            {/* neck and face */}
            <path d="M120 150h28v30c-8 6-20 6-28 0Z" fill="#7a4a32" />
            <ellipse cx="134" cy="118" rx="32" ry="38" fill="#8a5538" />
            {/* closed eyes and smile */}
            <path d="M114 118c4 4 10 4 14 0M140 118c4 4 10 4 14 0" stroke="#3b2418" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M126 138c5 4 11 4 16 0" stroke="#3b2418" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* hair bun */}
            <path d="M100 108c0-30 18-44 36-44s34 14 32 42c-6-14-18-24-34-24s-28 10-34 26Z" fill="#2b1b14" />
            <circle cx="134" cy="56" r="20" fill="#2b1b14" />
            <path d="M120 52c8-6 20-6 28 0" stroke="#4a3226" strokeWidth="2" fill="none" />
            {/* earring */}
            <circle cx="103" cy="132" r="3.2" fill="#e0b86a" />
        </svg>
    );
}
