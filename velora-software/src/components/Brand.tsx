import type { SVGProps } from "react";

/**
 * The Velora mark: two leaves opening into a "V" around a single bud.
 * A business in bloom, and someone being looked after. Same artwork as public/favicon.svg.
 */
export function LogoMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
    return (
        <svg
            viewBox="0 0 64 64"
            className="brand-mark"
            role={title ? "img" : undefined}
            aria-hidden={title ? undefined : true}
            focusable="false"
            {...props}
        >
            {title && <title>{title}</title>}
            <rect width="64" height="64" rx="16" fill="#3e5948" />
            <path d="M32 50C21 45 14.5 34 16 15.5 25.5 21 31 32 32 50Z" fill="#f8f7f2" />
            <path d="M32 50C43 45 49.5 34 48 15.5 38.5 21 33 32 32 50Z" fill="#a8bea9" />
            <circle cx="32" cy="16" r="4" fill="#f8f7f2" />
        </svg>
    );
}

/** Mark plus the "velora." wordmark. Drop it inside whatever link or heading carries the logo class. */
export function Logo() {
    return (
        <>
            <LogoMark />
            velora<span>.</span>
        </>
    );
}
