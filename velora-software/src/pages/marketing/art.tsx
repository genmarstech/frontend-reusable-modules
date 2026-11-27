/**
 * Original SVG artwork for the public site: the brush underline, two line icons
 * lucide doesn't have, and the spa still life that sits by the product screenshot.
 */

/** Hand-drawn underline under "Effortlessly organised." */
export function BrushStroke() {
    return (
        <svg className="hero2-brush" viewBox="0 0 420 26" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path
                d="M6 18C70 9 168 4 262 6c52 1 104 4 152 10-60-3-118-5-176-4C162 13 88 17 6 18Z"
                fill="currentColor"
            />
        </svg>
    );
}

const icon = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
};

/** A barber's straight razor. */
export function Razor() {
    return (
        <svg {...icon}>
            <rect x="9" y="2.5" width="6" height="19" rx="2" />
            <path d="M12 6v12M9 9h6M9 15h6" />
        </svg>
    );
}

/** A lotus flower, for spas. */
export function Lotus() {
    return (
        <svg {...icon}>
            <path d="M12 19c-2.5-2-3.5-5-3.5-7.5S10 6.5 12 4.5c2 2 3.5 4.5 3.5 7s-1 5.5-3.5 7.5Z" />
            <path d="M8.6 10.2C6.4 9.6 4 9.8 2.5 10.5c.6 4.4 4.2 8 9.5 8.5" />
            <path d="M15.4 10.2c2.2-.6 4.6-.4 6.1.3-.6 4.4-4.2 8-9.5 8.5" />
        </svg>
    );
}

/**
 * Spa still life in front of the screenshot: a pump bottle, a rolled green towel
 * and a eucalyptus sprig on a pale stone block. Used until a licensed photo is set.
 */
export function SpaProps() {
    return (
        <svg className="hero2-props" viewBox="0 0 360 260" aria-hidden="true" focusable="false">
            {/* stone block */}
            <rect x="20" y="214" width="330" height="40" rx="6" fill="#ece6db" />
            <path d="M26 214h318" stroke="#ddd5c6" strokeWidth="2" />
            <path d="M40 232c40-6 70 4 110-2M210 244c30-4 60 2 100-4" stroke="#e2dacb" strokeWidth="2" fill="none" />
            {/* eucalyptus sprig */}
            <g fill="#8fa88f">
                <path d="M86 214C84 160 92 112 110 70" stroke="#6f8a72" strokeWidth="2.5" fill="none" />
                {[
                    [104, 86, -30],
                    [94, 112, 25],
                    [100, 136, -25],
                    [88, 160, 30],
                    [94, 184, -20],
                    [112, 74, 20],
                ].map(([x, y, r], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="13" ry="9" transform={`rotate(${r} ${x} ${y})`} opacity={i % 2 ? 0.85 : 1} />
                ))}
            </g>
            {/* pump bottle */}
            <rect x="118" y="120" width="62" height="94" rx="12" fill="#f3eee4" stroke="#e2d9c8" strokeWidth="2" />
            <rect x="136" y="98" width="26" height="24" rx="4" fill="#c9a46a" />
            <path d="M149 98V80h-26" stroke="#c9a46a" strokeWidth="7" strokeLinecap="round" fill="none" />
            <rect x="130" y="150" width="38" height="30" rx="4" fill="#fbf8f2" />
            {/* rolled towel */}
            <rect x="182" y="150" width="150" height="64" rx="32" fill="#56705b" />
            <ellipse cx="300" cy="182" rx="32" ry="32" fill="#4a6350" />
            <path d="M300 160c10 0 18 10 18 22s-8 22-18 22-14-8-14-16 6-14 12-14" stroke="#3c5242" strokeWidth="4" fill="none" />
            <path d="M200 158v48M216 154v56M232 152v60M248 152v60M264 154v56" stroke="#4d6752" strokeWidth="3" opacity=".6" />
        </svg>
    );
}
