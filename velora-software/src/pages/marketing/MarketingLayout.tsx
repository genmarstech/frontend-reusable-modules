import { Navigate, Outlet, useLocation } from "react-router";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "./SiteFooter";

// The landing page used to be one long page. Old links like /#features still work.
const OLD_SECTIONS: Record<string, string> = {
    "#features": "/features",
    "#solutions": "/solutions",
    "#how-it-works": "/how-it-works",
    "#about": "/about",
};

/** Header, footer and page transition shared by the public marketing pages. */
function MarketingLayout() {
    const { pathname, hash } = useLocation();
    if (pathname === "/" && OLD_SECTIONS[hash]) return <Navigate to={OLD_SECTIONS[hash]} replace />;

    return (
        <>
            <SiteHeader />
            {/* Keyed by path, so each page fades in as you move between them. */}
            <main className="velora-home page-transition" id="main" tabIndex={-1} key={pathname}>
                <Outlet />
                <SiteFooter />
            </main>
        </>
    );
}

export default MarketingLayout;
