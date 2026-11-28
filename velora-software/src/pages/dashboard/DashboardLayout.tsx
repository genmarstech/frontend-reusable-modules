import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router";
import {
    BarChart3,
    Bell,
    CalendarDays,
    ChevronDown,
    Clock3,
    CreditCard,
    ExternalLink,
    LayoutGrid,
    Link2,
    LogOut,
    Menu,
    MessagesSquare,
    Scissors,
    Settings,
    UserRound,
    Users,
} from "lucide-react";

import { getBusiness, getBusinessStaff, getServices } from "../../lib/api/auth";
import {
    getBookings,
    getBookingsSeenAt,
    getNotifications,
    getPolicy,
    mediaUrl,
    publicBookingUrl,
} from "../../lib/api/bookings";
import { useAuth } from "../../context/auth-context";
import type { Business } from "../../types/business";
import { CATEGORY_LABELS } from "../../types/business";
import type { Booking, BookingPolicy } from "../../types/bookings";
import type { Service } from "../../types/services";
import type { Staff } from "../../types/staff";
import type { DashboardContext } from "./dashboard-context";
import { Avatar, PageLoading, Spinner } from "../../components/ui";
import { BudSprig } from "../../components/Decor";
import { formatDateTime, timeAgo } from "../../lib/format";
import { SITE } from "../../lib/site";
import { Logo } from "../../components/Brand";
import { LostArt } from "../../components/Illustrations";
import StatusPage from "../../components/StatusPage";
import { usePageMeta } from "../../lib/usePageMeta";

import "../DashboardOverview.css";
import "../../styles/dashboard.css";
import "../../styles/dashboard-refresh.css";

const NAV = [
    { to: "overview", label: "Overview", icon: LayoutGrid },
    { to: "bookings", label: "Bookings", icon: CalendarDays },
    { to: "customers", label: "Customers", icon: UserRound },
    { section: "Business operations" },
    { to: "services", label: "Services", icon: Scissors },
    { to: "team", label: "Team", icon: Users },
    { to: "schedule", label: "Schedule", icon: Clock3 },
    { to: "channels", label: "Channels", icon: MessagesSquare },
    { to: "payments", label: "Payments", icon: CreditCard },
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
    const { logout, user } = useAuth();

    const [business, setBusiness] = useState<Business | null>(null);
    const [policy, setPolicy] = useState<BookingPolicy | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [error, setError] = useState("");
    const [navOpen, setNavOpen] = useState(false);
    const [newBookings, setNewBookings] = useState<Booking[]>([]);
    const [failedMessages, setFailedMessages] = useState(0);
    const { pathname } = useLocation();

    // Tab title: "Bookings · Glow Salon · Velora"
    const section = pathname.split("/")[3] || "overview";
    const sectionLabel = NAV.find((item) => "to" in item && item.to === section);
    usePageMeta(
        [sectionLabel && "label" in sectionLabel ? sectionLabel.label : "Dashboard", business?.business_name]
            .filter(Boolean)
            .join(" · ")
    );

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

    // Badge on "Bookings": online bookings made since the owner last looked.
    useEffect(() => {
        if (!validId) return;
        let active = true;
        const check = () => {
            const since = getBookingsSeenAt(id) || new Date(Date.now() - 7 * 86400000).toISOString();
            getBookings(id, { channel: "online", booked_since: since, ordering: "-created_at", limit: 100 })
                .then((rows) => active && setNewBookings(rows))
                .catch(() => undefined);
            // Messages that failed in the last 30 days need a look (retry or fix the address).
            getNotifications(id, { status: "failed" })
                .then((rows) => {
                    const cutoff = Date.now() - 30 * 86400000;
                    if (active) setFailedMessages(rows.filter((n) => new Date(n.created_at).getTime() > cutoff).length);
                })
                .catch(() => undefined);
        };
        check();
        const timer = setInterval(check, 60_000);
        const onSeen = () => setNewBookings([]);
        window.addEventListener("velora:bookings-seen", onSeen);
        return () => {
            active = false;
            clearInterval(timer);
            window.removeEventListener("velora:bookings-seen", onSeen);
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

    const copyBookingLink = useCallback(async () => {
        const url = publicBookingUrl(business?.slug || String(id));
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch {
            window.prompt("Copy your booking link", url);
            return false;
        }
    }, [business?.slug, id]);

    if (!validId || error) {
        return (
            <StatusPage
                art={<LostArt />}
                title="We couldn’t open this business"
                text={validId ? error : "That link does not point to a business."}
            >
                <Link to="/businesses" className="v-btn">Back to your businesses</Link>
            </StatusPage>
        );
    }

    if (!business || !policy) {
        return <PageLoading label="Loading your workspace..." />;
    }

    const accountActions = (
        <AccountActions
            name={user?.name || business.business_name}
            email={user?.email || ""}
            slug={business.slug}
            newBookings={newBookings}
            failedMessages={failedMessages}
            timeZone={policy.timezone}
            onCopyLink={copyBookingLink}
            onLogout={handleLogout}
        />
    );

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
        accountActions,
        copyBookingLink,
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
                <Link to="/" className="v-sidebar-logo" aria-label="Velora home">
                    <Logo />
                </Link>

                <Link to="/businesses" className="v-business-switch" title="Switch business">
                    <div className="v-business-avatar">
                        {logo ? <img src={logo} alt="" /> : business.business_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="v-business-switch-text">
                        <strong>{business.business_name}</strong>
                        <small>
                            {CATEGORY_LABELS[business.business_category] || business.business_category_label} · Switch
                            <ChevronDown size={12} aria-hidden="true" />
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
                                {item.to === "bookings" && newBookings.length > 0 && (
                                    <span className="v-nav-badge" aria-label={`${newBookings.length} new`}>
                                        {newBookings.length > 99 ? "99+" : newBookings.length}
                                    </span>
                                )}
                                {item.to === "notifications" && failedMessages > 0 && (
                                    <span className="v-nav-badge" aria-label={`${failedMessages} failed`}>
                                        {failedMessages > 99 ? "99+" : failedMessages}
                                    </span>
                                )}
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="v-sidebar-footer">
                    <div className="v-help-card">
                        <BudSprig />
                        <strong>Need help?</strong>
                        {SITE.contactEmail ? (
                            <>
                                <p>Our support team is here for you.</p>
                                <a className="v-btn v-btn-pill v-btn-small" href={`mailto:${SITE.contactEmail}`}>
                                    Contact support
                                </a>
                            </>
                        ) : (
                            <>
                                <p>See how Velora fits your day, step by step.</p>
                                <Link className="v-btn v-btn-pill v-btn-small" to="/how-it-works">
                                    How it works
                                </Link>
                            </>
                        )}
                    </div>
                    <button type="button" className="v-logout" onClick={handleLogout}>
                        <LogOut size={17} aria-hidden="true" /> Log out
                    </button>
                </div>
            </aside>

            <div className="v-main">
                <div className="v-mobile-bar">
                    <Link to="/" className="v-sidebar-logo" aria-label="Velora home">
                        <Logo />
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
                        <div className="page-transition" key={pathname}>
                            <Outlet context={context} />
                        </div>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

/** Notifications bell and profile menu, shown at the right of each page header. */
function AccountActions({
    name,
    email,
    slug,
    newBookings,
    failedMessages,
    timeZone,
    onCopyLink,
    onLogout,
}: {
    name: string;
    email: string;
    slug: string;
    newBookings: Booking[];
    failedMessages: number;
    timeZone: string;
    onCopyLink: () => Promise<boolean>;
    onLogout: () => void;
}) {
    const [open, setOpen] = useState<"bell" | "profile" | null>(null);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const count = newBookings.length + failedMessages;

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className="v-account" ref={ref}>
            <button
                type="button"
                className="v-round-button"
                aria-label={count ? `Notifications, ${count} new` : "Notifications"}
                aria-expanded={open === "bell"}
                onClick={() => setOpen(open === "bell" ? null : "bell")}
            >
                <Bell size={18} />
                {count > 0 && <span className="v-dot-badge">{count > 9 ? "9+" : count}</span>}
            </button>
            <button
                type="button"
                className="v-profile-button"
                aria-label="Your account"
                aria-expanded={open === "profile"}
                onClick={() => setOpen(open === "profile" ? null : "profile")}
            >
                {name.trim().charAt(0).toUpperCase() || "V"}
            </button>

            {open === "bell" && (
                <div className="v-popover v-popover-wide" role="dialog" aria-label="Notifications">
                    <strong className="v-popover-title">Notifications</strong>
                    {count === 0 && <p className="v-popover-empty">You’re all caught up.</p>}
                    {newBookings.slice(0, 5).map((b) => (
                        <Link key={b.id} to="bookings?sort=newest" className="v-popover-item" onClick={() => setOpen(null)}>
                            <Avatar name={b.customer_name} size={30} />
                            <span>
                                <b>{b.customer_name}</b> booked {b.service_name}
                                <small>
                                    {formatDateTime(b.start, timeZone)} · {timeAgo(b.created_at)}
                                </small>
                            </span>
                        </Link>
                    ))}
                    {newBookings.length > 5 && (
                        <Link to="bookings?sort=newest" className="v-popover-more" onClick={() => setOpen(null)}>
                            {newBookings.length - 5} more new bookings →
                        </Link>
                    )}
                    {failedMessages > 0 && (
                        <Link to="notifications" className="v-popover-item is-warning" onClick={() => setOpen(null)}>
                            <span className="v-popover-icon"><Bell size={15} /></span>
                            <span>
                                <b>{failedMessages}</b> {failedMessages === 1 ? "message" : "messages"} could not be sent
                                <small>Check the address or try again</small>
                            </span>
                        </Link>
                    )}
                </div>
            )}

            {open === "profile" && (
                <div className="v-popover" role="menu" aria-label="Your account">
                    <div className="v-popover-user">
                        <strong>{name}</strong>
                        {email && <small>{email}</small>}
                    </div>
                    <a className="v-popover-link" href={`/book/${slug}`} target="_blank" rel="noreferrer" role="menuitem">
                        <ExternalLink size={15} /> Open booking page
                    </a>
                    <button
                        type="button"
                        className="v-popover-link"
                        role="menuitem"
                        onClick={async () => {
                            if (await onCopyLink()) {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1800);
                            }
                        }}
                    >
                        <Link2 size={15} /> {copied ? "Link copied" : "Copy booking link"}
                    </button>
                    <Link className="v-popover-link" to="settings" role="menuitem" onClick={() => setOpen(null)}>
                        <Settings size={15} /> Settings
                    </Link>
                    <Link className="v-popover-link" to="/businesses" role="menuitem">
                        <Users size={15} /> Switch business
                    </Link>
                    <button type="button" className="v-popover-link" role="menuitem" onClick={onLogout}>
                        <LogOut size={15} /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default DashboardLayout;
