/** Formatting helpers. Times are shown in the business's own time zone. */

export function formatMoney(value: string | number | null | undefined): string {
    const n = Number(value || 0);
    return `KES ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatTime(iso: string, timeZone?: string): string {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}

export function formatDate(iso: string, timeZone?: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone,
    }).format(new Date(iso));
}

export function formatDateTime(iso: string, timeZone?: string): string {
    return `${formatDate(iso, timeZone)}, ${formatTime(iso, timeZone)}`;
}

export function formatDayLabel(isoDate: string): string {
    // isoDate is a plain YYYY-MM-DD date; format it without shifting days.
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Today's date (YYYY-MM-DD) in a time zone. */
export function todayIn(timeZone?: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
    return parts;
}

/** The calendar date (YYYY-MM-DD) of an instant in a time zone. */
export function dateIn(iso: string, timeZone?: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(iso));
}

export function addDays(isoDate: string, days: number): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return date.toISOString().slice(0, 10);
}

/** Minutes since local midnight of an instant in a time zone. */
export function minutesIn(iso: string, timeZone?: string): number {
    const parts = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone,
    }).formatToParts(new Date(iso));
    const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
    return hour * 60 + minute;
}

/**
 * Turn a local date + "HH:MM" in a time zone into an ISO instant.
 * Used for time-off entry, where the owner types wall-clock times.
 */
export function zonedToIso(isoDate: string, hhmm: string, timeZone: string): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const [hh, mm] = hhmm.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    const offset = (instant: number) => {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).formatToParts(new Date(instant));
        const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
        const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
        return asUtc - instant;
    };
    const first = guess - offset(guess);
    const result = guess - offset(first);
    return new Date(result).toISOString();
}

export const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    held: "Held",
    confirmed: "Confirmed",
    rescheduled: "Rescheduled",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No-show",
    queued: "Scheduled",
    sent: "Sent",
    delivered: "Delivered",
    failed: "Failed",
    skipped: "Skipped",
    waiting: "Waiting",
    notified: "Notified",
    booked: "Booked",
    removed: "Removed",
};

export const CHANNEL_LABELS: Record<string, string> = {
    email: "Email",
    sms: "SMS",
    whatsapp: "WhatsApp",
    push: "Push",
};

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function shortTime(value: string | null | undefined): string {
    return value ? value.slice(0, 5) : "";
}
