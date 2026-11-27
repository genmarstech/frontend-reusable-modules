import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CalendarCheck, CalendarDays, Scissors, Users } from "lucide-react";

import { getBookings } from "../lib/api/bookings";
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
    const [openId, setOpenId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            getBookings(business.id, { date_from: today, date_to: today }),
            getBookings(business.id, {
                date_from: today,
                date_to: addDays(today, 7),
                status: "pending,held,confirmed,rescheduled",
            }),
            getBookings(business.id, { date_from: today, date_to: addDays(today, 60), status: "pending,held" }),
        ])
            .then(([t, u, a]) => {
                if (!active) return;
                setTodayBookings(t);
                setUpcoming(u);
                setAttention(a);
            })
            .catch((err) => console.error("Overview fetch error:", err));
        return () => {
            active = false;
        };
    }, [business.id, today, reload]);

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
                        <p>Next 7 days</p>
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
