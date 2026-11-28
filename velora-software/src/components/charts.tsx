import { type CSSProperties, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { compactNumber, niceTicks } from "../lib/chartScale";

/**
 * Small hand-drawn SVG charts for the dashboard. No chart library: they only
 * need a smooth line, a soft fill and (for the area chart) axes and a hover tip.
 */

type Point = [number, number];

/** A smooth path through points (Catmull-Rom turned into cubic Béziers). */
function smoothPath(points: Point[]): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
}

/** A tiny trend line with a fading fill. Decorative: the number beside it carries the meaning. */
export function Sparkline({ values, width = 96, height = 40 }: { values: number[]; width?: number; height?: number }) {
    const id = useId();
    if (values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const pad = 4;
    const points: Point[] = values.map((v, i) => [
        Math.round((i / (values.length - 1)) * width),
        // A flat line sits in the lower third rather than on the floor.
        max === min ? Math.round(height * 0.62) : Math.round(pad + (1 - (v - min) / span) * (height - pad * 2)),
    ]);
    const line = smoothPath(points);
    const last = points[points.length - 1];
    return (
        <svg className="v-spark" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
            <defs>
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
            <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx={last[0]} cy={last[1]} r="2.6" fill="currentColor" />
        </svg>
    );
}

export interface AreaPoint {
    label: string;
    /** Shown in the hover tip. */
    detail: string;
    value: number;
}

/** Revenue over time: soft area, dots on each point, a hover tip. */
export function AreaChart({
    points,
    height = 180,
    ariaLabel,
    formatTick = compactNumber,
    minScale = 1,
}: {
    points: AreaPoint[];
    height?: number;
    ariaLabel: string;
    /** How a y-axis value reads, such as "KES 1.5k". */
    formatTick?: (value: number) => string;
    /** The axis reaches at least this high, so an empty chart still shows a sensible scale. */
    minScale?: number;
}) {
    const id = useId();
    const [active, setActive] = useState<number | null>(null);
    const box = useRef<HTMLDivElement>(null);
    const tip = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(720);
    const [tipWidth, setTipWidth] = useState(0);
    // Draw at the real width so text and dots keep their shape.
    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const update = () => setWidth(Math.max(280, Math.round(el.clientWidth)));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    useLayoutEffect(() => {
        if (active !== null && tip.current) setTipWidth(tip.current.offsetWidth);
    }, [active, points]);

    const ticks = niceTicks(Math.max(...points.map((p) => p.value), minScale));
    const max = ticks[ticks.length - 1];
    const tickLabels = ticks.map(formatTick);
    // Room for the widest y label (about 6.6px a character at 11.5px DM Sans), so it never spills out of the card.
    const left = Math.max(24, Math.ceil(Math.max(...tickLabels.map((t) => t.length)) * 6.6) + 12);
    const right = 14;
    const top = 12;
    const bottom = 28;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const x = (i: number) => left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
    const y = (v: number) => top + (1 - v / max) * plotH;
    const coords: Point[] = points.map((p, i) => [Math.round(x(i) * 10) / 10, Math.round(y(p.value) * 10) / 10]);
    const line = smoothPath(coords);
    // Too many points to label each: label about seven of them.
    const labelEvery = Math.max(1, Math.ceil(points.length / 7));
    const showDots = points.length <= 31;

    // The nearest point to the pointer, so the tip follows the mouse or a finger.
    const pick = (clientX: number) => {
        const el = box.current;
        if (!el || points.length === 0) return;
        const rect = el.getBoundingClientRect();
        const px = ((clientX - rect.left) / rect.width) * width;
        const i = points.length === 1 ? 0 : Math.round(((px - left) / plotW) * (points.length - 1));
        setActive(Math.min(points.length - 1, Math.max(0, i)));
    };

    // Keep the tip inside the chart: clamp it sideways, and drop it below the point near the top.
    let tipStyle: CSSProperties | undefined;
    if (active !== null) {
        const half = tipWidth / 2;
        const cx = Math.min(Math.max(x(active), half), width - half);
        const cy = y(points[active].value);
        tipStyle = {
            left: `${cx}px`,
            top: `${cy}px`,
            transform: cy < 44 ? "translate(-50%, 14px)" : "translate(-50%, calc(-100% - 12px))",
            visibility: tipWidth ? "visible" : "hidden",
        };
    }

    return (
        <div className="v-area-chart" ref={box}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                height={height}
                role="img"
                aria-label={ariaLabel}
                onPointerMove={(e) => pick(e.clientX)}
                onPointerDown={(e) => pick(e.clientX)}
                onPointerLeave={() => setActive(null)}
            >
                <defs>
                    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--v-chart)" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="var(--v-chart)" stopOpacity="0.01" />
                    </linearGradient>
                </defs>
                {ticks.map((t, i) => (
                    <g key={t}>
                        <line x1={left} x2={width - right} y1={y(t)} y2={y(t)} className="v-area-grid" />
                        <text x={left - 8} y={y(t) + 4} textAnchor="end" className="v-area-tick">
                            {tickLabels[i]}
                        </text>
                    </g>
                ))}
                {points.map((p, i) =>
                    i % labelEvery === 0 || i === points.length - 1 ? (
                        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="v-area-tick">
                            {p.label}
                        </text>
                    ) : null
                )}
                {active !== null && (
                    <line x1={x(active)} x2={x(active)} y1={top} y2={top + plotH} className="v-area-cursor" />
                )}
                <path d={`${line} L${coords[coords.length - 1][0]},${top + plotH} L${coords[0][0]},${top + plotH} Z`} fill={`url(#${id})`} />
                <path d={line} fill="none" stroke="var(--v-chart)" strokeWidth="2.2" strokeLinecap="round" />
                {coords.map(([cx, cy], i) =>
                    showDots || i === active || i === coords.length - 1 ? (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={i === active || i === coords.length - 1 ? 5 : 3.6}
                            className="v-area-dot"
                        />
                    ) : null
                )}
                {/* Catches the pointer over the whole plot. No <title>: the browser would draw its own grey tip too. */}
                <rect x={left} y={top} width={plotW} height={plotH} fill="transparent" />
            </svg>
            {active !== null && (
                <div className="v-area-tip" ref={tip} style={tipStyle} role="status">
                    {points[active].detail}
                </div>
            )}
        </div>
    );
}
