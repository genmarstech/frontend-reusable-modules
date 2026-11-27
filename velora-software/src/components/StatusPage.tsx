import type { ReactNode } from "react";
import { Link } from "react-router";
import { LogoMark } from "./Brand";

/** A full-page message (not found, link expired and so on) with the Velora mark and an illustration. */
function StatusPage({
    art,
    code,
    title,
    text,
    children,
}: {
    art: ReactNode;
    code?: string;
    title: string;
    text: string;
    children?: ReactNode;
}) {
    return (
        <main className="v-status-page" id="main" tabIndex={-1}>
            <Link to="/" className="v-status-brand" aria-label="Velora home">
                <LogoMark />
                velora<span>.</span>
            </Link>
            <div className="v-status-art">{art}</div>
            {code && <span className="v-status-code">{code}</span>}
            <h1>{title}</h1>
            <p>{text}</p>
            {children && <div className="v-status-actions">{children}</div>}
        </main>
    );
}

export default StatusPage;
