import { Link } from "react-router";
import { Logo } from "../../components/Brand";
import { NAV_PAGES } from "./content";

function SiteFooter() {
    return (
        <footer className="velora-footer">
            <Link to="/" className="velora-logo" aria-label="Velora home">
                <Logo />
            </Link>
            <p>Bookings and appointments, thoughtfully made for businesses in Kenya.</p>
            <nav aria-label="Footer">
                {NAV_PAGES.map((page) => (
                    <Link key={page.to} to={page.to}>
                        {page.label}
                    </Link>
                ))}
                <Link to="/login">Log in</Link>
                <Link to="/register">Get started</Link>
            </nav>
            <small>
                © {new Date().getFullYear()} Velora. All rights reserved. · <Link to="/terms">Terms</Link> ·{" "}
                <Link to="/privacy">Privacy</Link>
            </small>
        </footer>
    );
}

export default SiteFooter;
