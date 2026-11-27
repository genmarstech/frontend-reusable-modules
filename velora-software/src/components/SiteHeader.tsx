import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";

const LINKS = [
    { id: "features", label: "Features" },
    { id: "solutions", label: "Solutions" },
    { id: "how-it-works", label: "How it works" },
    { id: "about", label: "About" },
];

/** Becomes "scrolled" once the page moves, so the bar gains a border and tightens up. */
function useScrolled(offset = 8): boolean {
    const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > offset);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > offset);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [offset]);
    return scrolled;
}

/** The id of the landing page section currently in view, for the active nav link. */
function useActiveSection(ids: string[]): string {
    const [active, setActive] = useState("");
    useEffect(() => {
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => Boolean(el));
        if (sections.length === 0 || !("IntersectionObserver" in window)) return;

        const visible = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
                    else visible.delete(entry.target.id);
                });
                // The first section (in page order) that is in the band near the top wins.
                const current = ids.find((id) => visible.has(id)) || "";
                setActive(current);
            },
            // Only the band just below the header counts as "reading this section".
            { rootMargin: "-90px 0px -55% 0px", threshold: [0, 0.01] }
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [ids]);
    return active;
}

const SECTION_IDS = LINKS.map((l) => l.id);

function SiteHeader() {
    const scrolled = useScrolled();
    const active = useActiveSection(SECTION_IDS);
    const [menuOpen, setMenuOpen] = useState(false);

    // Phone menu: Escape closes it, the page behind does not scroll,
    // and it closes by itself if the window grows to desktop width.
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        const desktop = window.matchMedia("(min-width: 769px)");
        const onResize = () => {
            if (desktop.matches) setMenuOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        desktop.addEventListener("change", onResize);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
            desktop.removeEventListener("change", onResize);
        };
    }, [menuOpen]);

    const close = () => setMenuOpen(false);

    const backToTop = (e: MouseEvent<HTMLAnchorElement>) => {
        // Already on the landing page: scroll up instead of reloading it.
        e.preventDefault();
        close();
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", "/");
    };

    return (
        <>
            {/* Outside the header: its backdrop blur would otherwise trap a fixed overlay inside it. */}
            {menuOpen && <button type="button" className="mobile-scrim" aria-label="Close menu" onClick={close} />}
            <header className={`velora-header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "is-open" : ""}`}>
                <a href="#main" className="skip-link">
                    Skip to content
                </a>

                <nav className="velora-nav" aria-label="Main">
                    <a href="/" className="velora-logo" onClick={backToTop} aria-label="Velora, back to top">
                        velora<span>.</span>
                    </a>

                    <ul className="nav-links">
                        {LINKS.map((link) => (
                            <li key={link.id}>
                                <a
                                    href={`#${link.id}`}
                                    className={active === link.id ? "is-active" : ""}
                                    aria-current={active === link.id ? "location" : undefined}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="nav-actions">
                        <Link to="/login" className="login-link">
                            Log in
                        </Link>
                        <Link to="/register" className="nav-cta">
                            Get started <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="mobile-menu"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="velora-mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                    </button>
                </nav>

                <div id="velora-mobile-menu" className="mobile-panel" hidden={!menuOpen}>
                    <ul>
                        {LINKS.map((link) => (
                            <li key={link.id}>
                                <a
                                    href={`#${link.id}`}
                                    onClick={close}
                                    className={active === link.id ? "is-active" : ""}
                                    aria-current={active === link.id ? "location" : undefined}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="mobile-panel-actions">
                        <Link to="/login" className="mobile-login" onClick={close}>
                            Log in
                        </Link>
                        <Link to="/register" className="nav-cta" onClick={close}>
                            Get started <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}

export default SiteHeader;
