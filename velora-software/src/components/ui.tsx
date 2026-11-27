import { useEffect, type ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import { STATUS_LABELS } from "../lib/format";

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
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="v-modal-backdrop" onMouseDown={onClose}>
            <div
                className={`v-modal ${wide ? "v-modal-wide" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <header className="v-modal-header">
                    <div>
                        <h2>{title}</h2>
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

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
    return (
        <div className="overview-empty-state">
            {icon}
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
    return <div className={`v-alert v-alert-${kind}`}>{children}</div>;
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="v-loading">
            <Loader2 size={20} className="v-spin" />
            <span>{label}</span>
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
