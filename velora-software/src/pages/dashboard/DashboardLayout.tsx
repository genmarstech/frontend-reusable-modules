import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router";
import {
    BarChart3,
    Bell,
    CalendarDays,
    Clock3,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    Settings,
    UserRound,
    Users,
} from "lucide-react";

import { getBusiness, getBusinessStaff, getServices } from "../../lib/api/auth";
import { getPolicy, mediaUrl, publicBookingUrl } from "../../lib/api/bookings";
import { useAuth } from "../../context/auth-context";
import type { Business } from "../../types/business";
import { CATEGORY_LABELS } from "../../types/business";
import type { BookingPolicy } from "../../types/bookings";
import type { Service } from "../../types/services";
import type { Staff } from "../../types/staff";
import type { DashboardContext } from "./dashboard-context";
import { PageLoading, Spinner } from "../../components/ui";

import "../DashboardOverview.css";
import "../../styles/dashboard.css";

const NAV = [
    { to: "overview", label: "Overview", icon: LayoutDashboard },
    { to: "bookings", label: "Bookings", icon: CalendarDays },
    { to: "customers", label: "Customers", icon: UserRound },
    { section: "Business" },
    { to: "services", label: "Services", icon: Scissors },
    { to: "team", label: "Team", icon: Users },
    { to: "schedule", label: "Schedule", icon: Clock3 },
    { section: "Insights" },
    { to: "analytics", label: "Analytics", icon: BarChart3 },
    { to: "notifications", label: "Notifications", icon: Bell },
    { to: "settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
    const { businessId } = useParams<{ businessId: string }>();
    const id = Number(businessId);
    const validId = Number.isInteger(id) && id > 0;
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [business, setBusiness] = useState<Business | null>(null);
    const [policy, setPolicy] = useState<BookingPolicy | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [error, setError] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!validId) return;
        let active = true;
        Promise.all([getBusiness(id), getPolicy(id), getServices(id), getBusinessStaff(id)])
            .then(([b, p, s, t]) => {
                if (!active) return;
                setBusiness(b);
                setPolicy(p);
                setServices(s);
                setStaff(t);
            })
            .catch((err) => {
                console.error("Dashboard load failed:", err);
                if (active) setError("We could not open this business. It may not exist or belong to another account.");
            });
        return () => {
            active = false;
        };
    }, [id, validId]);

    // Phone menu: close with Escape and stop the page behind it from scrolling.
    useEffect(() => {
        if (!navOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setNavOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [navOpen]);

    const reloadServices = useCallback(async () => {
        setServices(await getServices(id));
    }, [id]);

    const reloadStaff = useCallback(async () => {
        setStaff(await getBusinessStaff(id));
    }, [id]);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(publicBookingUrl(business?.slug || String(id)));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            window.prompt("Copy your booking link", publicBookingUrl(business?.slug || String(id)));
        }
    };

    if (!validId || error) {
        return (
            <div className="app-loading">
                <p role="alert">{validId ? error : "That link does not point to a business."}</p>
                <Link to="/businesses" className="v-btn">Back to your businesses</Link>
            </div>
        );
    }

    if (!business || !policy) {
        return <PageLoading label="Loading your workspace..." />;
    }

    const context: DashboardContext = {
        business,
        policy,
        services,
        staff,
        timeZone: policy.timezone,
        reloadServices,
        reloadStaff,
        setPolicy,
        setBusiness,
    };

    const logo = mediaUrl(business.business_logo);

    return (
        <div className={`v-shell ${navOpen ? "nav-open" : ""}`}>
            {navOpen && (
                <button
                    type="button"
                    className="v-nav-backdrop"
                    aria-label="Close menu"
                    onClick={() => setNavOpen(false)}
                />
            )}
            <aside className="v-sidebar" id="v-sidebar" aria-label="Dashboard navigation">
                <Link to="/" className="v-sidebar-logo">
                    velora<span>.</span>
                </Link>

                <Link to="/businesses" className="v-business-switch" title="Switch business">
                    <div className="v-business-avatar">
                        {logo ? <img src={logo} alt="" /> : business.business_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="v-business-switch-text">
                        <strong>{business.business_name}</strong>
                        <small>
                            {CATEGORY_LABELS[business.business_category] ||
                                business.business_category_label}{" "}
                            · Switch
                        </small>
                    </div>
                </Link>

                <nav className="v-nav" onClick={() => setNavOpen(false)}>
                    {NAV.map((item) =>
                        "section" in item ? (
                            <div className="v-nav-label" key={item.section}>
                                {item.section}
                            </div>
                        ) : (
                            <NavLink key={item.to} to={item.to}>
                                <item.icon />
                                {item.label}
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="v-sidebar-footer">
                    <div className="v-booking-link">
                        <p>Share your booking page so customers can book themselves.</p>
                        <div>
                            <a href={`/book/${business.slug}`} target="_blank" rel="noreferrer">
                                Open
                            </a>
                            <button type="button" onClick={copyLink}>
                                {copied ? "Copied" : "Copy link"}
                            </button>
                        </div>
                    </div>
                    <button type="button" className="v-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </aside>

            <div className="v-main">
                <div className="v-mobile-bar">
                    <Link to="/" className="v-sidebar-logo">
                        velora<span>.</span>
                    </Link>
                    <button
                        type="button"
                        className="v-icon-button"
                        onClick={() => setNavOpen(!navOpen)}
                        aria-label={navOpen ? "Close menu" : "Open menu"}
                        aria-expanded={navOpen}
                        aria-controls="v-sidebar"
                    >
                        <Menu size={18} />
                    </button>
                </div>
                <main className="v-content">
                    <Suspense fallback={<Spinner label="Loading..." />}>
                        <Outlet context={context} />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
