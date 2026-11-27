import { useEffect, useId, useRef, type ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import { STATUS_LABELS } from "../lib/format";
import { LogoMark } from "./Brand";

export function StatusBadge({ status }: { status: string }) {
    return <span className={`v-status v-status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function Modal({
    title,
    subtitle,
    onClose,
    children,
    wide = false,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: ReactNode;
    wide?: boolean;
}) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    // Keep the latest onClose without re-running the effect (callers often pass an inline arrow).
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Move focus into the dialog: the first field if there is one, otherwise the dialog itself.
        const firstField = dialog?.querySelector<HTMLElement>(
            ".v-modal-body input:not([type=hidden]):not([disabled]), .v-modal-body select, .v-modal-body textarea"
        );
        (firstField || dialog)?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
                return;
            }
            // Keep Tab inside the dialog.
            if (e.key !== "Tab" || !dialog) return;
            const focusable = Array.from(
                dialog.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, []);

    return (
        <div className="v-modal-backdrop" onMouseDown={onClose}>
            <div
                ref={dialogRef}
                className={`v-modal ${wide ? "v-modal-wide" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <header className="v-modal-header">
                    <div>
                        <h2 id={titleId}>{title}</h2>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <button type="button" className="v-icon-button" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </header>
                <div className="v-modal-body">{children}</div>
            </div>
        </div>
    );
}

/** Friendly "nothing here yet" panel. Pass `art` (an illustration) for the main empty views, or a small `icon`. */
export function EmptyState({
    icon,
    art,
    title,
    text,
    action,
}: {
    icon?: ReactNode;
    art?: ReactNode;
    title: string;
    text: string;
    action?: ReactNode;
}) {
    return (
        <div className={`overview-empty-state ${art ? "has-art" : ""}`}>
            {art ? <div className="v-empty-art">{art}</div> : icon && <span aria-hidden="true">{icon}</span>}
            <h3>{title}</h3>
            <p>{text}</p>
            {action}
        </div>
    );
}

export function Field({
    label,
    error,
    children,
    full = false,
    hint,
}: {
    label: string;
    error?: string;
    children: ReactNode;
    full?: boolean;
    hint?: string;
}) {
    return (
        <div className={`v-field ${full ? "v-field-full" : ""}`}>
            <label>
                <span>{label}</span>
                {children}
            </label>
            {hint && !error && <small className="v-hint">{hint}</small>}
            {error && <small className="field-error">{error}</small>}
        </div>
    );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: ReactNode }) {
    if (!children) return null;
    return (
        <div className={`v-alert v-alert-${kind}`} role={kind === "error" ? "alert" : "status"}>
            {children}
        </div>
    );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="v-loading" role="status">
            <Loader2 size={20} className="v-spin" aria-hidden="true" />
            <span>{label}</span>
        </div>
    );
}

/** Full-screen loading message, shown before a page (or the whole app) is ready. */
export function PageLoading({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="app-loading" role="status">
            <div className="app-loader" aria-hidden="true">
                <LogoMark />
                <div className="app-spinner" />
            </div>
            <p>{label}</p>
        </div>
    );
}

export function PageHeader({ title, text, actions }: { title: string; text?: string; actions?: ReactNode }) {
    return (
        <header className="dashboard-overview-header">
            <div>
                <h1>{title}</h1>
                {text && <p>{text}</p>}
            </div>
            {actions && <div className="v-header-actions">{actions}</div>}
        </header>
    );
}

export function Section({
    title,
    text,
    badge,
    actions,
    children,
}: {
    title: string;
    text?: string;
    badge?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="overview-section">
            <div className="overview-section-heading">
                <div>
                    <h2>{title}</h2>
                    {text && <p>{text}</p>}
                </div>
                {actions ? <div className="v-header-actions">{actions}</div> : badge && <span>{badge}</span>}
            </div>
            {children}
        </section>
    );
}
