import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";

import { getBookings } from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { addDays, dateIn, formatDayLabel, formatMoney, formatTime, minutesIn, todayIn } from "../../lib/format";
import type { Booking } from "../../types/bookings";
import { Alert, EmptyState, Field, PageHeader, Section, Spinner, StatusBadge } from "../../components/ui";
import { BookingDetailModal, NewBookingModal } from "./BookingModals";
import { useDashboard } from "./dashboard-context";

const STATUS_FILTERS = [
    { value: "", label: "All" },
    { value: "pending,held", label: "Needs action" },
    { value: "confirmed,rescheduled", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "cancelled,no_show", label: "Cancelled & no-shows" },
];

function BookingsPage() {
    const { business, staff, services, timeZone } = useDashboard();
    const today = todayIn(timeZone);

    const [view, setView] = useState<"list" | "day">("list");
    const [dateFrom, setDateFrom] = useState(today);
    const [dateTo, setDateTo] = useState(addDays(today, 6));
    const [day, setDay] = useState(today);
    const [status, setStatus] = useState("");
    const [staffFilter, setStaffFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [search, setSearch] = useState("");

    const [bookings, setBookings] = useState<Booking[] | null>(null);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [creating, setCreating] = useState<null | "booking" | "walk_in">(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        const range = view === "day" ? { date_from: day, date_to: day } : { date_from: dateFrom, date_to: dateTo };
        const timer = setTimeout(() => {
            getBookings(business.id, {
                ...range,
                status: view === "day" ? "" : status,
                staff: staffFilter,
                service: serviceFilter,
                search: search.trim(),
            })
                .then((rows) => {
                    if (!active) return;
                    setBookings(rows);
                    setError("");
                })
                .catch((err) => active && setError(handleApiError(err).message));
        }, 200);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [business.id, view, day, dateFrom, dateTo, status, staffFilter, serviceFilter, search, reload]);

    const groups = useMemo(() => {
        const map = new Map<string, Booking[]>();
        (bookings || []).forEach((b) => {
            const key = dateIn(b.start, timeZone);
            map.set(key, [...(map.get(key) || []), b]);
        });
        return [...map.entries()];
    }, [bookings, timeZone]);

    const refresh = () => setReload((n) => n + 1);

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Bookings"
                text="Every appointment, from online bookings to walk-ins."
                actions={
                    <>
                        <div className="v-tabs">
                            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
                                List
                            </button>
                            <button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>
                                Day calendar
                            </button>
                        </div>
                        <button className="v-btn v-btn-ghost" onClick={() => setCreating("walk_in")}>
                            <UserPlus /> Walk-in
                        </button>
                        <button className="v-btn" onClick={() => setCreating("booking")}>
                            <Plus /> New booking
                        </button>
                    </>
                }
            />

            <div className="v-filters">
                {view === "list" ? (
                    <>
                        <Field label="From">
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </Field>
                        <Field label="To">
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </Field>
                    </>
                ) : (
                    <div className="v-header-actions">
                        <button className="v-icon-button" onClick={() => setDay(addDays(day, -1))} aria-label="Previous day">
                            <ChevronLeft size={16} />
                        </button>
                        <input className="v-input" style={{ width: 170 }} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
                        <button className="v-icon-button" onClick={() => setDay(addDays(day, 1))} aria-label="Next day">
                            <ChevronRight size={16} />
                        </button>
                        <button className="v-btn v-btn-ghost v-btn-small" onClick={() => setDay(today)}>Today</button>
                    </div>
                )}
                <Field label="Staff">
                    <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
                        <option value="">Everyone</option>
                        {staff.map((m) => (
                            <option key={m.id} value={m.id}>{m.staff_name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Service">
                    <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                        <option value="">All services</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.service_name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Customer">
                    <input placeholder="Name, phone or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                </Field>
            </div>

            {view === "list" && (
                <div className="v-chips" style={{ marginBottom: 20 }}>
                    {STATUS_FILTERS.map((f) => (
                        <button key={f.label} className={`v-chip ${status === f.value ? "active" : ""}`} onClick={() => setStatus(f.value)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            <Alert>{error}</Alert>

            {bookings === null ? (
                <Spinner label="Loading bookings..." />
            ) : view === "day" ? (
                <Section title={formatDayLabel(day)} badge={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`}>
                    <DayCalendar
                        bookings={bookings}
                        staffColumns={staffFilter ? staff.filter((m) => String(m.id) === staffFilter) : staff}
                        onOpen={setOpenId}
                    />
                </Section>
            ) : bookings.length === 0 ? (
                <Section title="No bookings" text="Nothing matches these filters.">
                    <EmptyState
                        icon={<CalendarDays size={30} />}
                        title="No bookings in this range"
                        text="Share your booking page or add a booking yourself."
                    />
                </Section>
            ) : (
                <Section title="Appointments" badge={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`}>
                    {groups.map(([date, rows]) => (
                        <div className="v-day-group" key={date}>
                            <h3>{date === today ? "Today" : formatDayLabel(date)}</h3>
                            {rows.map((b) => (
                                <BookingRow key={b.id} booking={b} timeZone={timeZone} onOpen={() => setOpenId(b.id)} />
                            ))}
                        </div>
                    ))}
                </Section>
            )}

            {openId !== null && (
                <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} onChanged={refresh} />
            )}
            {creating && (
                <NewBookingModal
                    defaultWalkIn={creating === "walk_in"}
                    onClose={() => setCreating(null)}
                    onCreated={(b) => {
                        setCreating(null);
                        refresh();
                        setOpenId(b.id);
                    }}
                />
            )}
        </div>
    );
}

export function BookingRow({ booking, timeZone, onOpen }: { booking: Booking; timeZone: string; onOpen: () => void }) {
    return (
        <button type="button" className="v-booking-row" onClick={onOpen}>
            <div className="v-booking-time">
                <strong>{formatTime(booking.start, timeZone)}</strong>
                <small>{booking.duration_minutes} min</small>
            </div>
            <div className="v-booking-info">
                <strong>{booking.customer_name}</strong>
                <small>
                    {booking.service_name}
                    {booking.staff_name && ` · ${booking.staff_name}`} · {booking.channel_label}
                </small>
            </div>
            <div className="v-row-meta">
                <span className="v-muted">{formatMoney(booking.price)}</span>
                <StatusBadge status={booking.status} />
            </div>
        </button>
    );
}

const HOUR_HEIGHT = 64;

function DayCalendar({
    bookings,
    staffColumns,
    onOpen,
}: {
    bookings: Booking[];
    staffColumns: { id: number; staff_name: string }[];
    onOpen: (id: number) => void;
}) {
    const { timeZone } = useDashboard();
    const starts = bookings.map((b) => minutesIn(b.start, timeZone));
    const ends = bookings.map((b) => minutesIn(b.end, timeZone));
    const first = Math.min(8 * 60, ...starts);
    const last = Math.max(19 * 60, ...ends);
    const startHour = Math.floor(first / 60);
    const endHour = Math.ceil(last / 60);
    const height = (endHour - startHour) * HOUR_HEIGHT;

    const columns = [...staffColumns.map((m) => ({ id: m.id as number | null, name: m.staff_name }))];
    if (bookings.some((b) => b.staff === null)) columns.push({ id: null, name: "Unassigned" });

    if (columns.length === 0) {
        return <p className="v-muted">Add team members to see the day calendar.</p>;
    }

    return (
        <div className="v-calendar" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(150px, 1fr))` }}>
            <div className="v-cal-head" style={{ borderLeft: "none" }} />
            {columns.map((c) => (
                <div className="v-cal-head" key={c.id ?? "none"}>{c.name}</div>
            ))}
            <div className="v-cal-hours" style={{ height }}>
                {Array.from({ length: endHour - startHour }, (_, i) => (
                    <span className="v-cal-hour" key={i} style={{ top: i * HOUR_HEIGHT, transform: i === 0 ? "none" : undefined }}>
                        {String(startHour + i).padStart(2, "0")}:00
                    </span>
                ))}
            </div>
            {columns.map((c) => (
                <div className="v-cal-col" key={c.id ?? "none"} style={{ height, backgroundSize: `100% ${HOUR_HEIGHT}px` }}>
                    {bookings
                        .filter((b) => b.staff === c.id)
                        .map((b) => {
                            const top = ((minutesIn(b.start, timeZone) - startHour * 60) / 60) * HOUR_HEIGHT;
                            const h = Math.max(((minutesIn(b.end, timeZone) - minutesIn(b.start, timeZone)) / 60) * HOUR_HEIGHT - 3, 26);
                            return (
                                <button
                                    key={b.id}
                                    className={`v-cal-event v-status-${b.status}`}
                                    style={{ top, height: h }}
                                    onClick={() => onOpen(b.id)}
                                    title={`${b.customer_name} · ${b.service_name}`}
                                >
                                    <strong>{formatTime(b.start, timeZone)} {b.customer_name}</strong>
                                    {b.service_name}
                                </button>
                            );
                        })}
                </div>
            ))}
        </div>
    );
}

export default BookingsPage;
