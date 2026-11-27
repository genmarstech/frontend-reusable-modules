import { useEffect, useState, type MouseEvent } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Logo } from "./Brand";
import { NAV_PAGES } from "../pages/marketing/content";
import { ArrowRight, Menu, X } from "lucide-react";

/** Becomes "scrolled" once the page moves, so the bar gains a border and tightens up. */
function useScrolled(offset = 8): boolean {
    const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > offset);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > offset);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [offset]);
    return scrolled;
}

function SiteHeader() {
    const scrolled = useScrolled();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Moving to another page closes the phone menu.
    const [menuPath, setMenuPath] = useState(pathname);
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        setMenuOpen(false);
    }

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
        // Already on the home page: glide back up instead of reloading it.
        if (pathname !== "/") return;
        e.preventDefault();
        close();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "is-active" : "");

    return (
        <>
            {/* Outside the header: its backdrop blur would otherwise trap a fixed overlay inside it. */}
            {menuOpen && <button type="button" className="mobile-scrim" aria-label="Close menu" onClick={close} />}
            <header className={`velora-header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "is-open" : ""}`}>
                <a href="#main" className="skip-link">
                    Skip to content
                </a>

                <nav className="velora-nav" aria-label="Main">
                    <Link to="/" className="velora-logo" onClick={backToTop} aria-label="Velora home">
                        <Logo />
                    </Link>

                    <ul className="nav-links">
                        {NAV_PAGES.map((page) => (
                            <li key={page.to}>
                                <NavLink to={page.to} className={linkClass}>
                                    {page.label}
                                </NavLink>
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
                        {NAV_PAGES.map((page) => (
                            <li key={page.to}>
                                <NavLink to={page.to} onClick={close} className={linkClass}>
                                    {page.label}
                                </NavLink>
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
