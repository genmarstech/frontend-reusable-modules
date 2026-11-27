import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, Check, CircleDollarSign, LogIn, UserX, XCircle } from "lucide-react";

import {
    bookingAction,
    cancelBooking,
    createBooking,
    getBooking,
    getBookingHistory,
    getBookingNotifications,
    getCustomers,
    getOwnerAvailability,
    recordPayment,
    rescheduleBooking,
    updateBookingNotes,
    type BookingAction,
} from "../../lib/api/bookings";
import { handleApiError, fieldErrorsFrom } from "../../lib/api/handleErrors";
import { formatDateTime, formatMoney, formatTime, todayIn, CHANNEL_LABELS } from "../../lib/format";
import type { Booking, BookingEvent, Customer, NotificationLog, Slot } from "../../types/bookings";
import { Alert, Field, Modal, StatusBadge, Spinner } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

// ------------------------------------------------------------------
// Slot picker
// ------------------------------------------------------------------

export function SlotPicker({
    serviceId,
    staffId,
    value,
    onChange,
    excludeBookingId,
    override = false,
}: {
    serviceId: number | null;
    staffId: number | null;
    value: string;
    onChange: (start: string, staffIds: number[]) => void;
    excludeBookingId?: number;
    override?: boolean;
}) {
    const { business, timeZone } = useDashboard();
    const [date, setDate] = useState(todayIn(timeZone));
    const [slots, setSlots] = useState<Slot[] | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!serviceId) return;
        let active = true;
        getOwnerAvailability(business.id, {
            service: serviceId,
            staff: staffId,
            date,
            override,
            exclude: excludeBookingId,
        })
            .then((res) => {
                if (!active) return;
                setSlots(res.slots);
                setError("");
            })
            .catch((err) => {
                if (!active) return;
                setSlots([]);
                setError(handleApiError(err).message);
            });
        return () => {
            active = false;
        };
    }, [business.id, serviceId, staffId, date, override, excludeBookingId]);

    if (!serviceId) return <p className="v-muted">Choose a service to see open times.</p>;

    return (
        <div>
            <div className="v-form-grid" style={{ marginBottom: 12 }}>
                <Field label="Date">
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
            </div>
            {error && <Alert>{error}</Alert>}
            {slots === null ? (
                <Spinner label="Finding open times..." />
            ) : slots.length === 0 ? (
                <p className="v-muted">No open times on this day. Try another date.</p>
            ) : (
                <div className="v-slots">
                    {slots.map((slot) => (
                        <button
                            type="button"
                            key={slot.start}
                            className={`v-slot ${value === slot.start ? "active" : ""}`}
                            onClick={() => onChange(slot.start, slot.staff_ids)}
                        >
                            {slot.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------------
// New booking (phone, staff, walk-in)
// ------------------------------------------------------------------

export function NewBookingModal({
    onClose,
    onCreated,
    defaultWalkIn = false,
}: {
    onClose: () => void;
    onCreated: (booking: Booking) => void;
    defaultWalkIn?: boolean;
}) {
    const { business, services, staff } = useDashboard();
    const activeServices = services.filter((s) => s.is_available);

    const [channel, setChannel] = useState<"staff" | "phone" | "walk_in" | "whatsapp">(
        defaultWalkIn ? "walk_in" : "phone"
    );
    const [serviceId, setServiceId] = useState<number | null>(activeServices[0]?.id ?? null);
    const [staffId, setStaffId] = useState<number | null>(null);
    const [start, setStart] = useState("");
    const [override, setOverride] = useState(false);

    const [customerSearch, setCustomerSearch] = useState("");
    const [matches, setMatches] = useState<Customer[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
    const [notes, setNotes] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (customerSearch.trim().length < 2) return;
        let active = true;
        const timer = setTimeout(() => {
            getCustomers(business.id, customerSearch.trim())
                .then((rows) => active && setMatches(rows.slice(0, 6)))
                .catch(() => active && setMatches([]));
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [business.id, customerSearch]);

    const staffForService = staff.filter(
        (m) => m.is_available && (!m.skills?.length || (serviceId !== null && m.skills.includes(serviceId)))
    );

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        if (!serviceId) return setError("Choose a service.");
        if (channel !== "walk_in" && !start) return setError("Choose a time.");
        if (!customer && !newCustomer.name.trim()) return setError("Choose a customer or enter a name.");
        setSaving(true);
        try {
            const booking = await createBooking({
                business: business.id,
                service: serviceId,
                staff: staffId,
                channel,
                start: channel === "walk_in" ? undefined : start,
                customer: customer?.id ?? null,
                customer_name: customer ? undefined : newCustomer.name.trim(),
                customer_email: customer ? undefined : newCustomer.email.trim(),
                customer_phone: customer ? undefined : newCustomer.phone.trim(),
                intake_notes: notes,
                override_policy: override,
            });
            onCreated(booking);
        } catch (err) {
            setError(handleApiError(err).message);
            setFieldErrors(fieldErrorsFrom(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={channel === "walk_in" ? "Add a walk-in" : "New booking"}
            subtitle="Book on a customer's behalf. They get the same confirmation and reminders."
            onClose={onClose}
            wide
        >
            <form onSubmit={submit}>
                <Alert>{error}</Alert>

                <div className="v-chips" style={{ marginBottom: 18 }}>
                    {(["phone", "walk_in", "whatsapp", "staff"] as const).map((c) => (
                        <button
                            type="button"
                            key={c}
                            className={`v-chip ${channel === c ? "active" : ""}`}
                            onClick={() => setChannel(c)}
                        >
                            {{ phone: "Phone call", walk_in: "Walk-in now", whatsapp: "WhatsApp", staff: "Other" }[c]}
                        </button>
                    ))}
                </div>

                <div className="v-form-grid">
                    <Field label="Service" error={fieldErrors.service}>
                        <select
                            value={serviceId ?? ""}
                            onChange={(e) => {
                                setServiceId(Number(e.target.value) || null);
                                setStart("");
                            }}
                        >
                            {activeServices.length === 0 && <option value="">No services yet</option>}
                            {activeServices.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.service_name} · {s.duration_minutes} min · {formatMoney(s.price)}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Staff member" error={fieldErrors.staff}>
                        <select
                            value={staffId ?? ""}
                            onChange={(e) => {
                                setStaffId(Number(e.target.value) || null);
                                setStart("");
                            }}
                        >
                            <option value="">Anyone available</option>
                            {staffForService.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.staff_name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                {channel !== "walk_in" && (
                    <>
                        <h3 className="v-subheading">Time</h3>
                        <SlotPicker
                            serviceId={serviceId}
                            staffId={staffId}
                            value={start}
                            override={override}
                            onChange={(value) => setStart(value)}
                        />
                        <label className="v-check" style={{ marginTop: 12 }}>
                            <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
                            Ignore notice and booking-window rules (logged as an override)
                        </label>
                        {fieldErrors.start && <small className="field-error">{fieldErrors.start}</small>}
                    </>
                )}

                <h3 className="v-subheading">Customer</h3>
                {customer ? (
                    <div className="v-action-bar" style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                            <strong>{customer.full_name}</strong>{" "}
                            <span className="v-muted">{customer.phone_number || customer.email}</span>
                        </span>
                        <button type="button" className="v-link" onClick={() => setCustomer(null)}>
                            Change
                        </button>
                    </div>
                ) : (
                    <>
                        <Field label="Find an existing customer">
                            <input
                                placeholder="Search by name, phone or email"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                        </Field>
                        {customerSearch.trim().length >= 2 && matches.length > 0 && (
                            <div className="v-chips" style={{ margin: "10px 0" }}>
                                {matches.map((m) => (
                                    <button type="button" key={m.id} className="v-chip" onClick={() => setCustomer(m)}>
                                        {m.full_name} {m.phone_number && `· ${m.phone_number}`}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="v-muted" style={{ margin: "12px 0" }}>
                            Or add a new customer:
                        </p>
                        <div className="v-form-grid v-form-grid-3">
                            <Field label="Full name" error={fieldErrors.customer_name}>
                                <input
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </Field>
                            <Field label="Phone" error={fieldErrors.customer_phone}>
                                <input
                                    type="tel"
                                    placeholder="+254 7XX XXX XXX"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </Field>
                            <Field label="Email" error={fieldErrors.customer_email}>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </Field>
                        </div>
                    </>
                )}

                <div style={{ marginTop: 16 }}>
                    <Field label="Intake notes" full>
                        <textarea
                            placeholder="Allergies, preferences, anything the stylist should know"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Field>
                </div>

                <div className="v-form-actions">
                    <button type="button" className="v-btn v-btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="v-btn" disabled={saving}>
                        {saving ? "Saving..." : channel === "walk_in" ? "Add walk-in" : "Create booking"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ------------------------------------------------------------------
// Booking details
// ------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
    created: "Booking created",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
    completed: "Completed",
    no_show: "Marked as no-show",
    checked_in: "Checked in",
    payment_recorded: "Payment recorded",
    hold_expired: "Hold expired",
    refund_due: "Refund due",
    notes_updated: "Notes updated",
};

type Panel = "none" | "reschedule" | "cancel" | "payment";

export function BookingDetailModal({
    bookingId,
    onClose,
    onChanged,
}: {
    bookingId: number;
    onClose: () => void;
    onChanged: (booking: Booking) => void;
}) {
    const { timeZone } = useDashboard();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [history, setHistory] = useState<BookingEvent[]>([]);
    const [messages, setMessages] = useState<NotificationLog[]>([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [panel, setPanel] = useState<Panel>("none");
    const [notes, setNotes] = useState("");

    const [newStart, setNewStart] = useState("");
    const [override, setOverride] = useState(false);
    const [reason, setReason] = useState("");
    const [payment, setPayment] = useState({ amount: "", kind: "balance", method: "cash", reference: "" });

    useEffect(() => {
        let active = true;
        Promise.all([getBooking(bookingId), getBookingHistory(bookingId), getBookingNotifications(bookingId)])
            .then(([b, h, n]) => {
                if (!active) return;
                setBooking(b);
                setNotes(b.internal_notes);
                setHistory(h);
                setMessages(n);
            })
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [bookingId]);

    const refreshSide = async () => {
        const [h, n] = await Promise.all([getBookingHistory(bookingId), getBookingNotifications(bookingId)]);
        setHistory(h);
        setMessages(n);
    };

    const run = async (fn: () => Promise<Booking>) => {
        setBusy(true);
        setError("");
        try {
            const updated = await fn();
            setBooking(updated);
            onChanged(updated);
            setPanel("none");
            await refreshSide();
        } catch (err) {
            setError(handleApiError(err).message);
        } finally {
            setBusy(false);
        }
    };

    if (!booking) {
        return (
            <Modal title="Booking" onClose={onClose} wide>
                {error ? <Alert>{error}</Alert> : <Spinner />}
            </Modal>
        );
    }

    const active = ["pending", "held", "confirmed", "rescheduled"].includes(booking.status);
    const started = new Date(booking.start) <= new Date();
    const act = (a: BookingAction) => run(() => bookingAction(booking.id, a));

    return (
        <Modal
            title={`${booking.service_name} · ${booking.customer_name}`}
            subtitle={`${formatDateTime(booking.start, timeZone)} to ${formatTime(booking.end, timeZone)}`}
            onClose={onClose}
            wide
        >
            <Alert>{error}</Alert>

            <dl className="v-detail-grid">
                <div>
                    <dt>Status</dt>
                    <dd>
                        <StatusBadge status={booking.status} />
                        {booking.is_late_cancellation && <span className="v-muted"> · late</span>}
                    </dd>
                </div>
                <div>
                    <dt>Staff</dt>
                    <dd>{booking.staff_name || "Unassigned"}</dd>
                </div>
                <div>
                    <dt>Customer</dt>
                    <dd>
                        {booking.customer_name}
                        <br />
                        <span className="v-muted">
                            {[booking.customer_phone, booking.customer_email].filter(Boolean).join(" · ")}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt>Booked via</dt>
                    <dd>
                        {booking.channel_label}
                        {booking.reschedule_count > 0 && ` · moved ${booking.reschedule_count}×`}
                    </dd>
                </div>
                <div>
                    <dt>Price</dt>
                    <dd>
                        {formatMoney(booking.price)}
                        {Number(booking.cancellation_fee) > 0 && ` + fee ${formatMoney(booking.cancellation_fee)}`}
                    </dd>
                </div>
                <div>
                    <dt>Paid / balance</dt>
                    <dd>
                        {formatMoney(booking.amount_paid)} paid · {formatMoney(booking.balance_due)} due
                        {Number(booking.deposit_amount) > 0 && (
                            <>
                                <br />
                                <span className="v-muted">
                                    Deposit {formatMoney(booking.deposit_amount)}{" "}
                                    {booking.deposit_paid ? "received" : "not received"}
                                    {booking.status === "held" && booking.hold_expires_at &&
                                        ` · hold until ${formatTime(booking.hold_expires_at, timeZone)}`}
                                </span>
                            </>
                        )}
                    </dd>
                </div>
                {booking.intake_notes && (
                    <div style={{ gridColumn: "1 / -1" }}>
                        <dt>Intake notes</dt>
                        <dd>{booking.intake_notes}</dd>
                    </div>
                )}
                {booking.cancellation_reason && (
                    <div style={{ gridColumn: "1 / -1" }}>
                        <dt>Cancellation reason</dt>
                        <dd>{booking.cancellation_reason}</dd>
                    </div>
                )}
            </dl>

            <div className="v-action-bar">
                {["pending", "held", "rescheduled"].includes(booking.status) && (
                    <button className="v-btn v-btn-small" disabled={busy} onClick={() => act("confirm")}>
                        <Check /> Confirm
                    </button>
                )}
                {active && !booking.checked_in_at && (
                    <button className="v-btn v-btn-small v-btn-ghost" disabled={busy} onClick={() => act("check-in")}>
                        <LogIn /> Check in
                    </button>
                )}
                {["pending", "confirmed", "rescheduled"].includes(booking.status) && (
                    <button className="v-btn v-btn-small v-btn-ghost" disabled={busy} onClick={() => act("complete")}>
                        <Check /> Complete
                    </button>
                )}
                {active && (
                    <button className="v-btn v-btn-small v-btn-ghost" disabled={busy} onClick={() => setPanel("reschedule")}>
                        <CalendarClock /> Reschedule
                    </button>
                )}
                <button className="v-btn v-btn-small v-btn-ghost" disabled={busy} onClick={() => setPanel("payment")}>
                    <CircleDollarSign /> Record payment
                </button>
                {["pending", "confirmed", "rescheduled"].includes(booking.status) && started && (
                    <button className="v-btn v-btn-small v-btn-danger" disabled={busy} onClick={() => act("no-show")}>
                        <UserX /> No-show
                    </button>
                )}
                {active && (
                    <button className="v-btn v-btn-small v-btn-danger" disabled={busy} onClick={() => setPanel("cancel")}>
                        <XCircle /> Cancel
                    </button>
                )}
            </div>

            {panel === "reschedule" && (
                <div style={{ marginTop: 18 }}>
                    <h3 className="v-subheading">Pick a new time</h3>
                    <SlotPicker
                        serviceId={booking.service}
                        staffId={booking.staff}
                        value={newStart}
                        override={override}
                        excludeBookingId={booking.id}
                        onChange={(v) => setNewStart(v)}
                    />
                    <label className="v-check" style={{ marginTop: 12 }}>
                        <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
                        Override policy (logged)
                    </label>
                    <div className="v-form-actions">
                        <button className="v-btn v-btn-ghost" onClick={() => setPanel("none")}>Back</button>
                        <button
                            className="v-btn"
                            disabled={!newStart || busy}
                            onClick={() =>
                                run(() => rescheduleBooking(booking.id, { start: newStart, override_policy: override }))
                            }
                        >
                            Move booking
                        </button>
                    </div>
                </div>
            )}

            {panel === "cancel" && (
                <div style={{ marginTop: 18 }}>
                    <h3 className="v-subheading">Cancel this booking</h3>
                    <Field label="Reason (shared with the team)" full>
                        <input value={reason} onChange={(e) => setReason(e.target.value)} />
                    </Field>
                    <label className="v-check" style={{ marginTop: 12 }}>
                        <input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} />
                        Waive the late-cancellation policy (logged)
                    </label>
                    <div className="v-form-actions">
                        <button className="v-btn v-btn-ghost" onClick={() => setPanel("none")}>Back</button>
                        <button
                            className="v-btn v-btn-danger"
                            disabled={busy}
                            onClick={() => run(() => cancelBooking(booking.id, reason, override))}
                        >
                            Cancel booking
                        </button>
                    </div>
                </div>
            )}

            {panel === "payment" && (
                <div style={{ marginTop: 18 }}>
                    <h3 className="v-subheading">Record a payment</h3>
                    <div className="v-form-grid">
                        <Field label="Amount">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={payment.amount}
                                placeholder={booking.balance_due}
                                onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                            />
                        </Field>
                        <Field label="Type">
                            <select value={payment.kind} onChange={(e) => setPayment({ ...payment, kind: e.target.value })}>
                                <option value="deposit">Deposit</option>
                                <option value="balance">Balance</option>
                                <option value="cancellation_fee">Cancellation fee</option>
                                <option value="refund">Refund</option>
                            </select>
                        </Field>
                        <Field label="Method">
                            <select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>
                                <option value="cash">Cash</option>
                                <option value="mobile_money">Mobile money</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank transfer</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                        <Field label="Reference">
                            <input
                                placeholder="e.g. M-Pesa code"
                                value={payment.reference}
                                onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                            />
                        </Field>
                    </div>
                    <div className="v-form-actions">
                        <button className="v-btn v-btn-ghost" onClick={() => setPanel("none")}>Back</button>
                        <button
                            className="v-btn"
                            disabled={busy || !payment.amount}
                            onClick={() => run(() => recordPayment(booking.id, payment))}
                        >
                            Save payment
                        </button>
                    </div>
                </div>
            )}

            <h3 className="v-subheading">Internal notes</h3>
            <Field label="Only your team sees these" full>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            {notes !== booking.internal_notes && (
                <div className="v-form-actions" style={{ marginTop: 10 }}>
                    <button
                        className="v-btn v-btn-small"
                        disabled={busy}
                        onClick={() => run(() => updateBookingNotes(booking.id, { internal_notes: notes }))}
                    >
                        Save notes
                    </button>
                </div>
            )}

            {booking.payments.length > 0 && (
                <>
                    <h3 className="v-subheading">Payments</h3>
                    <div className="v-table-wrap">
                        <table className="v-table">
                            <tbody>
                                {booking.payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.kind_label}</td>
                                        <td>{p.method_label}{p.reference && <small>{p.reference}</small>}</td>
                                        <td>{formatDateTime(p.created_at, timeZone)}</td>
                                        <td className="v-num">{p.kind === "refund" ? "−" : ""}{formatMoney(p.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="v-two-col" style={{ marginTop: 6 }}>
                <div>
                    <h3 className="v-subheading">History</h3>
                    <ul className="v-timeline">
                        {history.map((ev) => (
                            <li key={ev.id}>
                                {ACTION_LABELS[ev.action] || ev.action}
                                {ev.is_policy_override && " (policy override)"}
                                {ev.note && ` · ${ev.note}`}
                                <small>
                                    {ev.actor_name} · {formatDateTime(ev.created_at, timeZone)}
                                </small>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="v-subheading">Messages</h3>
                    {messages.length === 0 ? (
                        <p className="v-muted">No messages yet.</p>
                    ) : (
                        <ul className="v-timeline">
                            {messages.slice(0, 12).map((m) => (
                                <li key={m.id}>
                                    {m.event_label} · {CHANNEL_LABELS[m.channel]} <StatusBadge status={m.status} />
                                    <small>
                                        {m.to_address} ·{" "}
                                        {m.status === "queued"
                                            ? `scheduled ${formatDateTime(m.scheduled_for, timeZone)}`
                                            : formatDateTime(m.sent_at || m.created_at, timeZone)}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
}
