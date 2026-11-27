import type { ReactNode } from "react";

/**
 * Velora's spot illustrations. Original artwork, drawn here in SVG so it stays crisp,
 * takes the brand colours, and adds nothing to download.
 *
 * Style rules: a soft sage blob behind, white cards with a deep green outline,
 * sage and sand accents, and a small leaf sprig (the leaves from the logo).
 *
 * They are decorative by default (hidden from screen readers). Pass `title`
 * when the picture carries meaning the text around it does not.
 */

const INK = "#3e5948";
const SAGE = "#a8bea9";
const MIST = "#edf2ec";
const SAND = "#efe6d6";
const PAPER = "#ffffff";

type ArtProps = { title?: string; className?: string };

function Art({ title, className = "", children }: ArtProps & { children: ReactNode }) {
    return (
        <svg
            viewBox="0 0 200 150"
            className={`v-illustration ${className}`}
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            focusable="false"
            fill="none"
            stroke={INK}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {title && <title>{title}</title>}
            <path
                d="M38 112c-18-22-10-62 22-78 30-15 52 4 80 2 26-2 44 18 38 46-6 30-36 44-72 44-30 0-56 2-68-14Z"
                fill={MIST}
                stroke="none"
            />
            {children}
        </svg>
    );
}

/** Two small leaves on a stem, placed at (x, y). */
function Sprig({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
    return (
        <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
            <path d="M0 0c2-10 2-18 0-26" />
            <path d="M0-10c-9-1-13-7-13-14 8 0 13 6 13 14Z" fill={SAGE} />
            <path d="M0-18c7-2 11-8 10-14-7 1-11 7-10 14Z" fill={PAPER} />
        </g>
    );
}

export function BookingArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="52" y="32" width="88" height="82" rx="12" fill={PAPER} />
            <path d="M52 52h88" />
            <rect x="52" y="32" width="88" height="20" rx="12" fill={SAGE} stroke="none" opacity=".55" />
            <path d="M74 26v12M118 26v12" />
            {[0, 1, 2, 3].map((c) =>
                [0, 1, 2].map((r) => (
                    <rect key={`${c}-${r}`} x={63 + c * 18} y={62 + r * 15} width="10" height="8" rx="2.5" fill={MIST} stroke="none" />
                ))
            )}
            <rect x="99" y="77" width="10" height="8" rx="2.5" fill={INK} stroke="none" />
            <circle cx="140" cy="104" r="17" fill={SAND} />
            <path d="M140 95v9l6 4" />
            <Sprig x={40} y={116} />
        </Art>
    );
}

export function ClientsArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="44" y="40" width="70" height="78" rx="12" fill={PAPER} />
            <circle cx="79" cy="66" r="12" fill={SAND} />
            <path d="M61 102c3-11 10-16 18-16s15 5 18 16" />
            <rect x="96" y="30" width="62" height="70" rx="12" fill={PAPER} />
            <circle cx="127" cy="54" r="10" fill={SAGE} />
            <path d="M111 84c2-9 8-13 16-13s14 4 16 13" />
            <path d="M150 108c-6-4-10-7-10-11a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-4 7-10 11Z" fill={SAGE} />
            <Sprig x={34} y={124} />
        </Art>
    );
}

export function TeamArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="40" y="34" width="120" height="84" rx="12" fill={PAPER} />
            {[0, 1, 2].map((i) => (
                <g key={i}>
                    <circle cx="60" cy={54 + i * 24} r="8" fill={[SAND, SAGE, MIST][i]} />
                    <rect x="76" y={50 + i * 24} width={[70, 44, 58][i]} height="8" rx="4" fill={[SAGE, SAND, SAGE][i]} stroke="none" />
                </g>
            ))}
            <path d="M76 114v-4M98 114v-4M120 114v-4M142 114v-4" opacity=".5" />
            <Sprig x={176} y={122} flip />
        </Art>
    );
}

export function InsightsArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="44" y="30" width="112" height="88" rx="12" fill={PAPER} />
            <rect x="60" y="82" width="14" height="22" rx="3" fill={MIST} />
            <rect x="82" y="70" width="14" height="34" rx="3" fill={SAND} />
            <rect x="104" y="58" width="14" height="46" rx="3" fill={SAGE} />
            <rect x="126" y="46" width="14" height="58" rx="3" fill={INK} stroke="none" />
            <path d="M58 64l24-12 22 6 30-18" strokeDasharray="1 6" />
            <Sprig x={36} y={118} />
        </Art>
    );
}

export function ServicesArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="48" y="30" width="100" height="88" rx="12" fill={PAPER} />
            {[0, 1, 2].map((i) => (
                <g key={i}>
                    <rect x="60" y={44 + i * 22} width="46" height="8" rx="4" fill={i === 0 ? SAGE : MIST} stroke="none" />
                    <rect x="116" y={44 + i * 22} width="20" height="8" rx="4" fill={SAND} stroke="none" />
                </g>
            ))}
            <g transform="translate(166 92) rotate(-20)">
                <circle cx="-8" cy="14" r="6" fill={PAPER} />
                <circle cx="8" cy="14" r="6" fill={PAPER} />
                <path d="M-4 9 6-22M4 9-6-22" />
            </g>
            <Sprig x={42} y={120} />
        </Art>
    );
}

export function MessagesArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="46" y="48" width="78" height="56" rx="10" fill={PAPER} />
            <path d="M48 52l37 28 37-28" />
            <path d="M112 32h40a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10h-22l-12 10v-10h-6a10 10 0 0 1-10-10V42a10 10 0 0 1 10-10Z" fill={SAGE} />
            <path d="M120 48h26M120 58h16" stroke={PAPER} />
            <Sprig x={150} y={124} flip />
        </Art>
    );
}

export function PhoneBookingArt(props: ArtProps) {
    return (
        <Art {...props}>
            <rect x="72" y="18" width="58" height="112" rx="12" fill={PAPER} />
            <path d="M93 26h16" />
            <rect x="81" y="38" width="40" height="14" rx="4" fill={INK} stroke="none" />
            <rect x="81" y="58" width="40" height="18" rx="4" fill={MIST} stroke="none" />
            <rect x="81" y="80" width="40" height="18" rx="4" fill={SAND} stroke="none" />
            <rect x="81" y="104" width="40" height="12" rx="6" fill={SAGE} stroke="none" />
            <circle cx="142" cy="46" r="13" fill={PAPER} />
            <path d="M136 46l4 4 8-8" />
            <Sprig x={58} y={122} />
        </Art>
    );
}

export function LostArt(props: ArtProps) {
    return (
        <Art {...props}>
            <path d="M100 128V34" />
            <path d="M100 42h46l10 10-10 10h-46Z" fill={PAPER} />
            <path d="M100 70H58l-10 10 10 10h42Z" fill={SAGE} />
            <path d="M112 52h24M62 80h26" opacity=".6" />
            <path d="M70 128h60" />
            <Sprig x={130} y={128} flip />
            <Sprig x={76} y={128} />
        </Art>
    );
}

export function WiltedArt(props: ArtProps) {
    return (
        <Art {...props}>
            <path d="M72 96h56l-6 32H78Z" fill={SAND} />
            <path d="M100 96c0-22 6-34 18-42" />
            <path d="M118 54c10 2 16 10 16 20-10-2-16-9-16-20Z" fill={SAGE} />
            <path d="M104 78c-12-2-20 4-22 14 10 2 18-4 22-14Z" fill={PAPER} />
            <path d="M136 36l4 6M148 44l-6 3M128 30l1 7" opacity=".6" />
        </Art>
    );
}

export function SuccessArt(props: ArtProps) {
    return (
        <Art {...props}>
            <circle cx="100" cy="74" r="34" fill={PAPER} />
            <path d="M84 75l11 11 22-24" strokeWidth={4} />
            <Sprig x={62} y={118} />
            <Sprig x={138} y={118} flip />
            <circle cx="148" cy="40" r="4" fill={SAGE} stroke="none" />
            <circle cx="52" cy="48" r="3" fill={SAND} stroke="none" />
        </Art>
    );
}
