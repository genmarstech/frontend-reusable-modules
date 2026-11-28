import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
    ArrowRight,
    ArrowDown,
    ArrowUp,
    CalendarDays,
    Check,
    ChevronDown,
    Coffee,
    LineChart,
    MoreVertical,
    Plus,
    Scissors,
    Users,
    Wallet,
} from "lucide-react";

import { useAuth } from "../context/auth-context";
import { getBookings, getBookingsSeenAt, getOverview, getPerformance, markBookingsSeen } from "../lib/api/bookings";
import { addDays, dateIn, formatMoney, formatTime, shortDate, todayIn } from "../lib/format";
import { PHOTOS, servicePhoto } from "../lib/photos";
import type { Booking, Overview, Performance } from "../types/bookings";
import { Avatar, EmptyState, StatusBadge } from "../components/ui";
import { AreaChart, Sparkline } from "../components/charts";
import { LeafSpray, RelaxArt } from "../components/Decor";
import { BookingArt, PhoneBookingArt } from "../components/Illustrations";
import { BookingDetailModal, NewBookingModal } from "./dashboard/BookingModals";
import { useDashboard } from "./dashboard/dashboard-context";
import { ShareLinkModal } from "./dashboard/ShareLinkModal";
import "./DashboardOverview.css";

type Range = 7 | 30 | 90 | "custom";

function hourIn(timeZone: string): number {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()));
}

function greeting(timeZone: string): string {
    const hour = hourIn(timeZone);
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

/** "Tue, 11 Nov 2026" for a plain YYYY-MM-DD date. */
function longDay(isoDate: string): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

function weekday(isoDate: string): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
}

function duration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} h`;
}

function Change({ value, unit = "%", suffix }: { value: number | null; unit?: string; suffix?: string }) {
    if (value === null) return <span className="ov-change is-flat">{suffix ? `No data ${suffix}` : "No earlier data"}</span>;
    const up = value > 0;
    const flat = value === 0;
    return (
        <span className={`ov-change ${flat ? "is-flat" : up ? "is-up" : "is-down"}`}>
            {!flat && (up ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
            {flat ? "No change" : `${up ? "+" : ""}${Math.abs(value) >= 10 ? Math.round(value) : value}${unit}`}
            {suffix && ` ${suffix}`}
        </span>
    );
}

function StatCard({
    icon,
    label,
    value,
    foot,
    spark,
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    foot: ReactNode;
    spark?: number[];
}) {
    return (
        <div className="ov-stat">
            <div className="ov-icon-tile">{icon}</div>
            <div className="ov-stat-text">
                <p>{label}</p>
                <div className="ov-stat-row">
                    <div>
                        <strong>{value}</strong>
                        <small>{foot}</small>
                    </div>
                    {spark && <Sparkline values={spark} width={110} height={44} />}
                </div>
            </div>
        </div>
    );
}

function CardHeading({ icon, title, link, children }: { icon?: ReactNode; title: string; link?: ReactNode; children?: ReactNode }) {
    return (
        <div className="ov-card-heading">
            {icon && <span className="ov-heading-icon">{icon}</span>}
            <h2>{title}</h2>
            {children}
            {link}
        </div>
    );
}

function DashboardOverview() {
    const { business, timeZone, accountActions } = useDashboard();
    const { user } = useAuth();
    const navigate = useNavigate();
    const today = todayIn(timeZone);

    const [day, setDay] = useState(today);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [latest, setLatest] = useState<Booking[] | null>(null);
    const [seenAt] = useState(() => getBookingsSeenAt(business.id));
    const [range, setRange] = useState<Range>(7);
    const [custom, setCustom] = useState({ date_from: addDays(today, -13), date_to: today });
    const [performance, setPerformance] = useState<Performance | null>(null);
    const [openId, setOpenId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [reload, setReload] = useState(0);
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([getOverview(business.id, day), getBookings(business.id, { ordering: "-created_at", limit: 5 })])
            .then(([o, l]) => {
                if (!active) return;
                setOverview(o);
                setLatest(l);
                setError("");
                markBookingsSeen(business.id);
            })
            .catch((err) => {
                console.error("Overview fetch error:", err);
                if (active) setError("We could not load your overview. Check your connection and try again.");
            });
        return () => {
            active = false;
        };
    }, [business.id, day, reload]);

    useEffect(() => {
        let active = true;
        const params = range === "custom" ? custom : { days: range };
        if (range === "custom" && custom.date_from > custom.date_to) return;
        getPerformance(business.id, params)
            .then((p) => active && setPerformance(p))
            .catch((err) => console.error("Performance fetch error:", err));
        return () => {
            active = false;
        };
    }, [business.id, range, custom, reload]);

    // New online bookings arrive while the dashboard is open: refresh every minute.
    useEffect(() => {
        const timer = setInterval(() => setReload((n) => n + 1), 60_000);
        return () => clearInterval(timer);
    }, []);

    const isToday = day === today;
    const firstName = (user?.name || "").trim().split(/\s+/)[0];
    const stats = overview?.stats;

    const chartPoints = useMemo(
        () =>
            (performance?.series || []).map((p) => ({
                label: performance?.bucket === "week" || performance!.series.length > 8 ? shortDate(p.date) : weekday(p.date),
                detail: `${p.date === p.end ? shortDate(p.date) : `${shortDate(p.date)} – ${shortDate(p.end)}`}: ${formatMoney(
                    p.revenue
                )} · ${p.bookings} ${p.bookings === 1 ? "booking" : "bookings"}`,
                value: Number(p.revenue),
            })),
        [performance]
    );

    const share = () => setSharing(true);

    const setup = overview?.setup;
    const shareStep = setup?.steps.find((s) => s.key === "share");
    const nextStep = setup?.steps.find((s) => !s.done);
    const goToStep = (link: string) => (link === "share" ? share() : navigate(`../${link}`));

    return (
        <div className="dashboard-overview ov">
            <header className="ov-header">
                <div>
                    <h1>
                        {greeting(timeZone)}
                        {firstName ? `, ${firstName}` : ""}! <span aria-hidden="true">👋</span>
                    </h1>
                    <p>
                        {isToday
                            ? "Here’s what’s happening with your business today."
                            : `Here’s how ${longDay(day)} looks for ${business.business_name}.`}
                    </p>
                </div>
                <div className="v-header-actions">
                    <label className="ov-date-pill">
                        <CalendarDays size={16} aria-hidden="true" />
                        <span>{longDay(day)}</span>
                        <ChevronDown size={14} aria-hidden="true" />
                        <input
                            type="date"
                            value={day}
                            aria-label="Show a different day"
                            onChange={(e) => e.target.value && setDay(e.target.value)}
                        />
                    </label>
                    {!isToday && (
                        <button type="button" className="v-link ov-today" onClick={() => setDay(today)}>
                            Back to today
                        </button>
                    )}
                    {accountActions}
                </div>
            </header>

            {error && <div className="v-alert v-alert-error">{error}</div>}

            {overview?.readiness && overview.readiness.issues.length > 0 && (
                <section className={`ov-ready ${overview.readiness.ready ? "is-partial" : "is-closed"}`} role="alert">
                    <div className="ov-ready-head">
                        <strong>
                            {overview.readiness.ready
                                ? "Some services can't be booked online yet"
                                : "Your booking link is closed: customers can't book yet"}
                        </strong>
                        <small>Online times come from your team's working hours. Fix these to open your link:</small>
                    </div>
                    <ul>
                        {overview.readiness.issues.map((issue) => (
                            <li key={issue.key}>
                                <span>{issue.text}</span>
                                <Link to={`../${issue.link}`} className="v-btn v-btn-small">
                                    {issue.link === "team" ? "Open Team" : issue.link === "schedule" ? "Open Schedule" : "Open Services"}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {overview && (overview.waitlist || 0) > 0 && (
                <Link to="../schedule" className="ov-waitlist-note">
                    {overview.waitlist} {overview.waitlist === 1 ? "person is" : "people are"} on the waitlist for a slot. See who →
                </Link>
            )}

            <section className="ov-stats" aria-label="Key numbers">
                <StatCard
                    icon={<CalendarDays />}
                    label={isToday ? "Today’s bookings" : `Bookings on ${shortDate(day)}`}
                    value={stats ? stats.today.value : "–"}
                    foot={
                        stats && (stats.today.change_pct === null ? (
                            <span className="ov-change is-flat">
                                {stats.today.previous === 0 ? "None the day before" : ""}
                            </span>
                        ) : (
                            <Change value={stats.today.change_pct} suffix={isToday ? "vs yesterday" : "vs day before"} />
                        ))
                    }
                    spark={stats?.today.spark}
                />
                <StatCard
                    icon={<CalendarDays />}
                    label="Upcoming bookings"
                    value={stats ? stats.upcoming.value : "–"}
                    foot="Next 7 days"
                    spark={stats?.upcoming.spark}
                />
                <StatCard
                    icon={<Scissors />}
                    label="Total services"
                    value={stats ? stats.services.total : "–"}
                    foot={stats ? `${stats.services.value} active` : ""}
                    spark={stats?.services.spark}
                />
                <StatCard
                    icon={<Users />}
                    label="Total staff"
                    value={stats ? stats.staff.value : "–"}
                    foot={
                        stats && (
                            <span className="ov-available">
                                <i aria-hidden="true" /> {stats.staff.available} available
                            </span>
                        )
                    }
                    spark={stats?.staff.spark}
                />
            </section>

            <div className="ov-row ov-row-main">
                {/* Today's schedule */}
                <section className="ov-card ov-schedule">
                    <CardHeading
                        icon={<CalendarDays size={17} />}
                        title={isToday ? "Today’s schedule" : `Schedule · ${shortDate(day)}`}
                        link={
                            <div className="ov-heading-links">
                                <button type="button" className="v-link" onClick={() => setCreating(true)}>
                                    <Plus size={14} /> New
                                </button>
                                <Link to="../bookings" className="v-link">
                                    View all <ArrowRight size={14} />
                                </Link>
                            </div>
                        }
                    />
                    {!overview ? (
                        <div className="ov-skeleton" />
                    ) : overview.schedule.length === 0 ? (
                        <EmptyState
                            art={<PhoneBookingArt />}
                            title={isToday ? "Nothing on today" : "Nothing on this day"}
                            text="You’re closed or fully free. Share your booking page so customers can book."
                        />
                    ) : (
                        <ol className="ov-timeline">
                            {overview.schedule.map((item) => (
                                <li key={`${item.type}-${item.start}-${"id" in item ? item.id : ""}`}>
                                    <time dateTime={item.start}>{formatTime(item.start, timeZone)}</time>
                                    <span className="ov-timeline-dot" aria-hidden="true" />
                                    {item.type === "available" ? (
                                        <div className="ov-slot is-free">
                                            <div>
                                                <strong>Available</strong>
                                                <small>
                                                    Free for bookings until {formatTime(item.end, timeZone)} · {duration(item.minutes)}
                                                </small>
                                            </div>
                                            <Coffee size={17} aria-hidden="true" />
                                        </div>
                                    ) : (
                                        <button type="button" className="ov-slot" onClick={() => setOpenId(item.id)}>
                                            <Avatar name={item.customer_name} size={36} />
                                            <div>
                                                <strong>{item.customer_name}</strong>
                                                <small>
                                                    {item.service_name} · {duration(item.duration_minutes)}
                                                    {item.staff_name && ` · ${item.staff_name}`}
                                                </small>
                                            </div>
                                            <StatusBadge status={item.status} />
                                            <MoreVertical size={16} className="ov-more" aria-label="Open booking" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                {/* Latest bookings */}
                <section className="ov-card ov-latest">
                    <CardHeading
                        icon={<CalendarDays size={17} />}
                        title="Latest bookings"
                        link={
                            <Link to="../bookings?sort=newest" className="v-link">
                                See all <ArrowRight size={14} />
                            </Link>
                        }
                    />
                    {latest === null ? (
                        <div className="ov-skeleton" />
                    ) : latest.length === 0 ? (
                        <EmptyState
                            art={<BookingArt />}
                            title="No bookings yet"
                            text="When a customer books on your booking page, it shows up here."
                        />
                    ) : (
                        <div className="ov-table-wrap">
                            <table className="ov-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Client</th>
                                        <th>Service</th>
                                        <th>Staff</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latest.map((b) => {
                                        const date = dateIn(b.start, timeZone);
                                        const when =
                                            date === today ? "Today" : date === addDays(today, 1) ? "Tomorrow" : shortDate(date);
                                        return (
                                            <tr
                                                key={b.id}
                                                tabIndex={0}
                                                onClick={() => setOpenId(b.id)}
                                                onKeyDown={(e) => e.key === "Enter" && setOpenId(b.id)}
                                            >
                                                <td className="ov-nowrap">
                                                    {when} · {formatTime(b.start, timeZone)}
                                                </td>
                                                <td>
                                                    <span className="ov-client">
                                                        <Avatar name={b.customer_name} size={28} />
                                                        {b.customer_name}
                                                        {!!seenAt && b.created_at > seenAt && <span className="v-new-pill">New</span>}
                                                    </span>
                                                </td>
                                                <td>{b.service_name}</td>
                                                <td>{b.staff_name || "Any"}</td>
                                                <td>
                                                    <StatusBadge status={b.status} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Setup checklist */}
                <section className="ov-card ov-setup">
                    <LeafSpray className="ov-setup-leaves" />
                    <div className="ov-setup-head">
                        <h2>{setup && setup.completed === setup.total ? "Your business is all set" : "Complete your business setup"}</h2>
                        {setup && (
                            <span className="ov-pill">
                                {setup.completed} of {setup.total} completed
                            </span>
                        )}
                    </div>
                    <div
                        className="ov-progress"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={setup?.total || 5}
                        aria-valuenow={setup?.completed || 0}
                        aria-label="Setup progress"
                    >
                        <span style={{ width: `${setup ? (100 * setup.completed) / setup.total : 0}%` }} />
                    </div>
                    <ul className="ov-steps">
                        {setup?.steps.map((step) => (
                            <li key={step.key} className={step.done ? "is-done" : ""}>
                                <button type="button" onClick={() => goToStep(step.link)}>
                                    <span className="ov-check" aria-hidden="true">
                                        {step.done && <Check size={12} strokeWidth={3} />}
                                    </span>
                                    <span>
                                        <strong>{step.label}</strong>
                                        <small>{step.text}</small>
                                        {step.progress && !step.done && (
                                            <span className="ov-step-progress" aria-hidden="true">
                                                {Array.from({ length: step.progress.target }, (_, i) => (
                                                    <i key={i} className={i < step.progress!.value ? "on" : ""} />
                                                ))}
                                            </span>
                                        )}
                                    </span>
                                    <span className="v-sr-only">{step.done ? "(done)" : "(to do)"}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {setup && (
                        <button
                            type="button"
                            className="v-btn v-btn-pill ov-setup-cta"
                            onClick={() => (nextStep ? goToStep(nextStep.link) : window.open(`/book/${business.slug}`, "_blank"))}
                        >
                            {nextStep ? (nextStep.key === "share" ? "Share your link" : "Continue setup") : "Open booking page"}
                            <ArrowRight size={15} />
                        </button>
                    )}
                </section>
            </div>

            <div className="ov-row ov-row-bottom">
                {/* Business performance */}
                <section className="ov-card ov-performance">
                    <CardHeading icon={<LineChart size={17} />} title="Business performance">
                        <div className="ov-segment" role="group" aria-label="Period">
                            {([7, 30, 90, "custom"] as Range[]).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    className={range === r ? "active" : ""}
                                    aria-pressed={range === r}
                                    onClick={() => setRange(r)}
                                >
                                    {r === "custom" ? "Custom" : `${r} days`}
                                </button>
                            ))}
                        </div>
                    </CardHeading>
                    {range === "custom" && (
                        <div className="ov-custom-range">
                            <label>
                                From
                                <input
                                    type="date"
                                    className="v-input"
                                    value={custom.date_from}
                                    max={custom.date_to}
                                    onChange={(e) => e.target.value && setCustom({ ...custom, date_from: e.target.value })}
                                />
                            </label>
                            <label>
                                To
                                <input
                                    type="date"
                                    className="v-input"
                                    value={custom.date_to}
                                    min={custom.date_from}
                                    onChange={(e) => e.target.value && setCustom({ ...custom, date_to: e.target.value })}
                                />
                            </label>
                        </div>
                    )}
                    <div className="ov-metrics">
                        <div className="ov-metric">
                            <span className="ov-metric-icon"><Wallet size={17} /></span>
                            <div>
                                <strong>{performance ? formatMoney(performance.revenue.value) : "–"}</strong>
                                <small>
                                    Booked revenue {performance && <Change value={performance.revenue.change_pct} />}
                                </small>
                            </div>
                        </div>
                        <div className="ov-metric">
                            <span className="ov-metric-icon"><CalendarDays size={17} /></span>
                            <div>
                                <strong>{performance ? performance.bookings.value : "–"}</strong>
                                <small>
                                    Total bookings {performance && <Change value={performance.bookings.change_pct} />}
                                </small>
                            </div>
                        </div>
                        <div className="ov-metric" title="Share of this period’s clients who had booked with you before">
                            <span className="ov-metric-icon"><Users size={17} /></span>
                            <div>
                                <strong>
                                    {performance?.returning_clients.value_pct != null ? `${performance.returning_clients.value_pct}%` : "–"}
                                </strong>
                                <small>
                                    Returning clients{" "}
                                    {performance && <Change value={performance.returning_clients.change_pts} unit=" pts" />}
                                </small>
                            </div>
                        </div>
                    </div>
                    {chartPoints.length > 0 && (
                        <AreaChart
                            points={chartPoints}
                            ariaLabel={`Booked revenue per ${performance?.bucket === "week" ? "week" : "day"}`}
                        />
                    )}
                </section>

                {/* Top services */}
                <section className="ov-card ov-top">
                    <CardHeading
                        title="Your top services"
                        link={
                            <Link to="../services" className="v-link">
                                View all <ArrowRight size={14} />
                            </Link>
                        }
                    />
                    {!overview ? (
                        <div className="ov-skeleton" />
                    ) : overview.top_services.length === 0 ? (
                        <p className="ov-muted">Your most booked services from the last 4 weeks will show here.</p>
                    ) : (
                        <ul className="ov-top-list">
                            {overview.top_services.map((s) => {
                                const photo = servicePhoto(s.name);
                                return (
                                    <li key={s.service_id}>
                                        <span className="ov-thumb">
                                            {photo ? <img src={photo} alt="" loading="lazy" /> : <Scissors size={18} aria-hidden="true" />}
                                        </span>
                                        <div>
                                            <strong>{s.name}</strong>
                                            <small>
                                                {s.bookings} {s.bookings === 1 ? "booking" : "bookings"}
                                            </small>
                                        </div>
                                        <Sparkline values={s.spark} width={64} height={30} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Promo */}
                <section className="ov-promo">
                    <div className="ov-promo-text">
                        <h2>Grow your beauty business with Velora.</h2>
                        <p>More bookings. Happier clients. A smoother workflow.</p>
                        <button type="button" className="ov-promo-button" onClick={share}>
                            Share booking page <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="ov-promo-art">
                        {PHOTOS.dashboardPromo ? <img src={PHOTOS.dashboardPromo} alt="" /> : <RelaxArt />}
                    </div>
                </section>
            </div>

            {sharing && (
                <ShareLinkModal
                    businessId={business.id}
                    businessName={business.business_name}
                    slug={business.slug}
                    progress={shareStep?.progress}
                    onClose={() => setSharing(false)}
                />
            )}

            {openId !== null && (
                <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} onChanged={() => setReload((n) => n + 1)} />
            )}
            {creating && (
                <NewBookingModal
                    onClose={() => setCreating(false)}
                    onCreated={(b) => {
                        setCreating(false);
                        setReload((n) => n + 1);
                        setOpenId(b.id);
                    }}
                />
            )}
        </div>
    );
}

export default DashboardOverview;
