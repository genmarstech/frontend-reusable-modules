import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./Brand";
import { FEATURES, INDUSTRIES, NAV_PAGES, slugify } from "../pages/marketing/content";

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

/** The two menus in the bar: what Velora does, and who it is for. */
const MENUS: Record<string, { to: string; label: string; text: string; icon?: typeof FEATURES[number]["icon"] }[]> = {
    "/features": FEATURES.map((f) => ({ to: `/features#${slugify(f.title)}`, label: f.title, text: f.summary, icon: f.icon })),
    "/solutions": INDUSTRIES.map((i) => ({ to: `/solutions#${slugify(i.name)}`, label: i.name, text: i.text })),
};

function SiteHeader() {
    const scrolled = useScrolled();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdown, setDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);

    // Moving to another page closes the phone menu and any open dropdown.
    const [menuPath, setMenuPath] = useState(pathname);
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        setMenuOpen(false);
        setDropdown(null);
    }

    // Dropdowns close on Escape or a click elsewhere.
    useEffect(() => {
        if (!dropdown) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDropdown(null);
        const onDown = (e: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) setDropdown(null);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onDown);
        };
    }, [dropdown]);

    // Phone menu: Escape closes it, the page behind does not scroll,
    // and it closes by itself if the window grows to desktop width.
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        const desktop = window.matchMedia("(min-width: 961px)");
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

    const close = () => {
        setMenuOpen(false);
        setDropdown(null);
    };

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

                <nav className="velora-nav" aria-label="Main" ref={navRef}>
                    <Link to="/" className="velora-logo" onClick={backToTop} aria-label="Velora home">
                        <Logo />
                    </Link>

                    <ul className="nav-links">
                        {NAV_PAGES.map((page) => {
                            const items = MENUS[page.to];
                            if (!items) {
                                return (
                                    <li key={page.to}>
                                        <NavLink to={page.to} className={linkClass}>
                                            {page.label}
                                        </NavLink>
                                    </li>
                                );
                            }
                            const open = dropdown === page.to;
                            const id = `menu-${page.to.slice(1)}`;
                            return (
                                <li key={page.to} className="nav-dropdown">
                                    <button
                                        type="button"
                                        className={`nav-dropdown-toggle ${pathname === page.to ? "is-active" : ""}`}
                                        aria-expanded={open}
                                        aria-controls={id}
                                        onClick={() => setDropdown(open ? null : page.to)}
                                    >
                                        {page.label} <ChevronDown size={15} aria-hidden="true" />
                                    </button>
                                    <div id={id} className="nav-dropdown-panel" hidden={!open}>
                                        <ul>
                                            {items.map((item) => (
                                                <li key={item.to}>
                                                    <Link to={item.to} onClick={close}>
                                                        {item.icon && (
                                                            <span className="nav-dropdown-icon" aria-hidden="true">
                                                                <item.icon />
                                                            </span>
                                                        )}
                                                        <span>
                                                            <strong>{item.label}</strong>
                                                            <small>{item.text}</small>
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link to={page.to} className="nav-dropdown-all" onClick={close}>
                                            {page.to === "/features" ? "See all features" : "See how Velora fits your business"}{" "}
                                            <ArrowRight size={15} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
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
