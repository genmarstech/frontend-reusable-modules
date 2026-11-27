import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";

/** The heading block at the top of each public page. */
export function PageIntro({
    eyebrow,
    title,
    accent,
    text,
    art: Art,
}: {
    eyebrow: string;
    title: string;
    accent?: string;
    text: string;
    art?: ComponentType<{ className?: string }>;
}) {
    return (
        <section className={`page-intro ${Art ? "has-art" : ""}`}>
            <div className="page-intro-text">
                <span className="section-eyebrow">{eyebrow}</span>
                <h1>
                    {title}
                    {accent && (
                        <>
                            <br />
                            <span>{accent}</span>
                        </>
                    )}
                </h1>
                <p>{text}</p>
            </div>
            {Art && <Art className="page-intro-art" />}
        </section>
    );
}

/** The dark green "get started" band that closes every public page. */
export function FinalCta({
    eyebrow = "YOUR NEXT CHAPTER STARTS HERE",
    children,
}: {
    eyebrow?: string;
    children?: ReactNode;
}) {
    return (
        <section className="final-cta">
            <div className="cta-decoration" aria-hidden="true">
                <Sparkles />
            </div>
            <span>{eyebrow}</span>
            <h2>
                Make room for what
                <br />
                <em>you do best.</em>
            </h2>
            <p>
                {children ||
                    "Let Velora keep the diary, send the reminders and tidy up the details, while you look after your clients."}
            </p>
            <Link to="/register" className="cta-button">
                Get started with Velora <ArrowRight size={18} aria-hidden="true" />
            </Link>
        </section>
    );
}
