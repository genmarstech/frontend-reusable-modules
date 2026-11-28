/** Axis helpers for the dashboard charts. */

/**
 * Whole-number ticks from 0 up past the largest value: at most five of them,
 * on a "nice" step (1, 2, 2.5, 5 × 10^n), never a fraction. With no data the
 * axis reads just 0 and 1 rather than thirds.
 */
export function niceTicks(maxValue: number, maxIntervals = 4): number[] {
    if (!(maxValue > 0)) return [0, 1];
    let step = 1;
    for (let magnitude = 1; ; magnitude *= 10) {
        const found = [1, 2, 2.5, 5].map((m) => m * magnitude).find((s) => Number.isInteger(s) && Math.ceil(maxValue / s) <= maxIntervals);
        if (found) {
            step = found;
            break;
        }
    }
    const count = Math.max(1, Math.ceil(maxValue / step));
    return Array.from({ length: count + 1 }, (_, i) => i * step);
}

/** 1500 → "1.5k", 2000000 → "2m". Whole numbers stay as they are. */
export function compactNumber(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}m`;
    if (abs >= 1000) return `${+(n / 1000).toFixed(1)}k`;
    return String(Math.round(n));
}
