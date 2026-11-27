import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CalendarCheck, CalendarDays, Inbox, Scissors, Users } from "lucide-react";

import { getBookings, getBookingsSeenAt, markBookingsSeen } from "../lib/api/bookings";
import { addDays, formatMoney, todayIn } from "../lib/format";
import type { Booking } from "../types/bookings";
import { EmptyState, Spinner } from "../components/ui";
import { BookingRow } from "./dashboard/BookingsPage";
import { BookingDetailModal, NewBookingModal } from "./dashboard/BookingModals";
import { useDashboard } from "./dashboard/dashboard-context";
import "./DashboardOverview.css";

function DashboardOverview() {
    const { business, services, staff, timeZone } = useDashboard();
    const today = todayIn(timeZone);

    const [todayBookings, setTodayBookings] = useState<Booking[] | null>(null);
    const [upcoming, setUpcoming] = useState<Booking[]>([]);
    const [attention, setAttention] = useState<Booking[]>([]);
    const [latest, setLatest] = useState<Booking[] | null>(null);
    // Bookings made after the owner last looked are flagged "New" on this visit.
    const [seenAt] = useState(() => getBookingsSeenAt(business.id));
    const [openId, setOpenId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            getBookings(business.id, { date_from: today, date_to: today }),
            getBookings(business.id, { date_from: today, status: "pending,held,confirmed,rescheduled" }),
            getBookings(business.id, { date_from: today, date_to: addDays(today, 60), status: "pending,held" }),
            getBookings(business.id, { ordering: "-created_at", limit: 6 }),
        ])
            .then(([t, u, a, l]) => {
                if (!active) return;
                setTodayBookings(t);
                setUpcoming(u);
                setAttention(a);
                setLatest(l);
                markBookingsSeen(business.id);
            })
            .catch((err) => console.error("Overview fetch error:", err));
        return () => {
            active = false;
        };
    }, [business.id, today, reload]);

    // New online bookings arrive while the dashboard is open: refresh every minute.
    useEffect(() => {
        const timer = setInterval(() => setReload((n) => n + 1), 60_000);
        return () => clearInterval(timer);
    }, []);

    const todaysValue = (todayBookings || [])
        .filter((b) => !["cancelled", "no_show"].includes(b.status))
        .reduce((sum, b) => sum + Number(b.price), 0);

    return (
        <div className="dashboard-overview">
            <header className="dashboard-overview-header">
                <div>
                    <h1>Business Overview</h1>
                    <p>Manage and monitor {business.business_name}'s day at a glance.</p>
                </div>
                <div className="v-header-actions">
                    <button className="v-btn" onClick={() => setCreating(true)}>New booking</button>
                </div>
            </header>

            {/* Overview statistics */}
            <section className="overview-stats">
                <div className="overview-stat-card">
                    <div className="overview-stat-icon"><CalendarCheck /></div>
                    <div>
                        <p>Today's bookings</p>
                        <h2>{todayBookings ? todayBookings.filter((b) => b.status !== "cancelled").length : "–"}</h2>
                    </div>
                </div>
                <div className="overview-stat-card">
                    <div className="overview-stat-icon"><CalendarDays /></div>
                    <div>
                        <p>Upcoming bookings</p>
                        <h2>{upcoming.length}</h2>
                    </div>
                </div>
                <div className="overview-stat-card">
                    <div className="overview-stat-icon"><Scissors /></div>
                    <div>
                        <p>Total Services</p>
                        <h2>{services.length}</h2>
                    </div>
                </div>
                <div className="overview-stat-card">
                    <div className="overview-stat-icon"><Users /></div>
                    <div>
                        <p>Total Staff</p>
                        <h2>{staff.length}</h2>
                    </div>
                </div>
            </section>

            {/* Latest bookings, whatever their appointment date */}
            <section className="overview-section">
                <div className="overview-section-heading">
                    <div>
                        <h2>Latest bookings</h2>
                        <p>The most recent bookings, with the customer's contact details.</p>
                    </div>
                    <Link to="../bookings?sort=newest" className="v-link">See all →</Link>
                </div>
                {latest === null ? (
                    <Spinner />
                ) : latest.length === 0 ? (
                    <EmptyState
                        icon={<Inbox size={30} />}
                        title="No bookings yet"
                        text="When a customer books on your booking page, it shows up here."
                    />
                ) : (
                    latest.map((b) => (
                        <BookingRow
                            key={b.id}
                            booking={b}
                            timeZone={timeZone}
                            showDate
                            isNew={!!seenAt && b.created_at > seenAt}
                            onOpen={() => setOpenId(b.id)}
                        />
                    ))
                )}
            </section>

            {attention.length > 0 && (
                <section className="overview-section">
                    <div className="overview-section-heading">
                        <div>
                            <h2>Needs your attention</h2>
                            <p>Pending requests and bookings waiting for a deposit.</p>
                        </div>
                        <span>{attention.length} waiting</span>
                    </div>
                    {attention.slice(0, 5).map((b) => (
                        <BookingRow key={b.id} booking={b} timeZone={timeZone} onOpen={() => setOpenId(b.id)} />
                    ))}
                </section>
            )}

            {/* Today */}
            <section className="overview-section">
                <div className="overview-section-heading">
                    <div>
                        <h2>Today's schedule</h2>
                        <p>Booked value today: {formatMoney(todaysValue)}</p>
                    </div>
                    <Link to="../bookings" className="v-link">View all bookings →</Link>
                </div>
                {todayBookings === null ? (
                    <Spinner />
                ) : todayBookings.length === 0 ? (
                    <EmptyState
                        icon={<CalendarDays size={30} />}
                        title="No appointments today"
                        text="Share your booking page so customers can book themselves."
                    />
                ) : (
                    todayBookings.map((b) => (
                        <BookingRow key={b.id} booking={b} timeZone={timeZone} onOpen={() => setOpenId(b.id)} />
                    ))
                )}
            </section>

            {/* Services */}
            <section className="overview-section">
                <div className="overview-section-heading">
                    <div>
                        <h2>Our Services</h2>
                        <p>Services offered by your business.</p>
                    </div>
                    <span>{services.length} {services.length === 1 ? "service" : "services"}</span>
                </div>

                {services.length === 0 ? (
                    <div className="overview-empty-state">
                        <Scissors size={30} />
                        <h3>No services added yet</h3>
                        <p>Add services to let customers know what you offer.</p>
                    </div>
                ) : (
                    <div className="services-list">
                        {services.map((service) => (
                            <div className="service-card" key={service.id}>
                                <div className="service-icon"><Scissors size={20} /></div>
                                <div className="service-details">
                                    <h3>{service.service_name}</h3>
                                    <p>
                                        {service.duration_minutes} min · {formatMoney(service.price)}
                                        {service.service_description && <><br />{service.service_description}</>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Staff */}
            <section className="overview-section">
                <div className="overview-section-heading">
                    <div>
                        <h2>Your Team</h2>
                        <p>Staff members registered under this business.</p>
                    </div>
                    <span>{staff.length} {staff.length === 1 ? "member" : "members"}</span>
                </div>

                {staff.length === 0 ? (
                    <div className="overview-empty-state">
                        <AlertCircle size={30} />
                        <h3>No staff members yet</h3>
                        <p>Customers can only book once at least one team member is added.</p>
                    </div>
                ) : (
                    <div className="staff-list">
                        {staff.map((member) => (
                            <div className="staff-card" key={member.id}>
                                <div className="staff-avatar">{member.staff_name.charAt(0).toUpperCase()}</div>
                                <div className="staff-details">
                                    <h3>{member.staff_name}</h3>
                                    <p>{member.staff_email}</p>
                                </div>
                                <span className={member.is_available ? "staff-status available" : "staff-status unavailable"}>
                                    {member.is_available ? "Available" : "Unavailable"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

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
