import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { CalendarClock, CheckCircle2, Loader2, XCircle } from "lucide-react";

import {
    cancelManagedBooking,
    confirmManagedBooking,
    getManagedBooking,
    getPublicAvailability,
    rescheduleManagedBooking,
    updateManagedPreferences,
} from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { addDays, formatDateTime, formatMoney, formatTime, todayIn } from "../../lib/format";
import type { PublicBooking, Slot } from "../../types/bookings";
import { Alert, Field, PageLoading, StatusBadge } from "../../components/ui";
import { LogoMark } from "../../components/Brand";
import { LostArt } from "../../components/Illustrations";
import StatusPage from "../../components/StatusPage";
import { usePageMeta } from "../../lib/usePageMeta";
import "../../styles/dashboard.css";
import "../../styles/booking.css";

type Mode = "view" | "reschedule" | "cancel";

function ManageBooking() {
    const { token = "" } = useParams<{ token: string }>();
    const [booking, setBooking] = useState<PublicBooking | null>(null);
    usePageMeta(booking ? `Your booking at ${booking.business_name}` : "Your booking");
    const [loadError, setLoadError] = useState("");
    const [mode, setMode] = useState<Mode>("view");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<Slot[] | null>(null);
    const [newSlot, setNewSlot] = useState<Slot | null>(null);
    const [reason, setReason] = useState("");
    const [prefs, setPrefs] = useState<Record<string, boolean> | null>(null);

    useEffect(() => {
        getManagedBooking(token)
            .then((b) => {
                setBooking(b);
                setDate(todayIn(b.policy?.timezone));
            })
            .catch(() => setLoadError("We could not find this booking. The link may be incomplete."));
    }, [token]);

    useEffect(() => {
        if (!booking || mode !== "reschedule" || !date) return;
        let active = true;
        getPublicAvailability(booking.business_id, { service: booking.service_id, staff: booking.staff_id, date })
            .then((res) => active && setSlots(res.slots.filter((s) => s.start !== booking.start)))
            .catch(() => active && setSlots([]));
        return () => {
            active = false;
        };
    }, [booking, mode, date]);

    const run = async (fn: () => Promise<PublicBooking>, success: string) => {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const updated = await fn();
            setBooking(updated);
            setMode("view");
            setNewSlot(null);
            setMessage(success);
        } catch (err) {
            setError(handleApiError(err).message);
        } finally {
            setBusy(false);
        }
    };

    if (loadError) {
        return (
            <StatusPage art={<LostArt />} title="We couldn’t find this booking" text="The link may be incomplete. Check the link in your confirmation message, or contact the business.">
                <Link to="/" className="v-btn">Go to Velora</Link>
            </StatusPage>
        );
    }

    if (!booking) {
        return (
<PageLoading label="Loading your booking..." />
        );
    }

    const tz = booking.policy?.timezone;
    const isOver = ["cancelled", "completed", "no_show"].includes(booking.status);

    return (
        <main className="bk-page">
            <section className="bk-hero">
                <div className="bk-hero-inner">
                    <div className="bk-hero-logo">{booking.business_name.charAt(0)}</div>
                    <div>
                        <span className="bk-eyebrow">Your booking</span>
                        <h1>{booking.business_name}</h1>
                        <p>Hi {booking.customer_name.split(" ")[0]}, here are your appointment details.</p>
                    </div>
                </div>
            </section>

            <div className="bk-container">
                <div className="bk-card">
                    <Alert>{error}</Alert>
                    <Alert kind="success">{message}</Alert>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <h2>{booking.service_name}</h2>
                        <StatusBadge status={booking.status} />
                    </div>

                    <dl className="bk-summary">
                        <div><dt>When</dt><dd>{formatDateTime(booking.start, tz)} – {formatTime(booking.end, tz)}</dd></div>
                        <div><dt>With</dt><dd>{booking.staff_name || "Our team"}</dd></div>
                        <div><dt>Price</dt><dd>{formatMoney(booking.price)}</dd></div>
                        <div>
                            <dt>Balance</dt>
                            <dd>
                                {formatMoney(booking.balance_due)}
                                {Number(booking.deposit_amount) > 0 && ` · deposit ${booking.deposit_paid ? "paid" : "due"}`}
                            </dd>
                        </div>
                    </dl>

                    {booking.status === "held" && (
                        <Alert kind="info">
                            Your slot is on hold until{" "}
                            {booking.hold_expires_at ? formatTime(booking.hold_expires_at, tz) : "the deposit arrives"}. Pay the deposit of{" "}
                            {formatMoney(booking.deposit_amount)} to confirm it.
                        </Alert>
                    )}
                    {Number(booking.cancellation_fee) > 0 && (
                        <Alert kind="info">A fee of {formatMoney(booking.cancellation_fee)} applies to this booking.</Alert>
                    )}

                    {!isOver && mode === "view" && (
                        <div className="v-action-bar">
                            {booking.can_confirm && (
                                <button className="v-btn" disabled={busy} onClick={() => run(() => confirmManagedBooking(token), "Thanks, your booking is confirmed.")}>
                                    <CheckCircle2 /> I'll be there
                                </button>
                            )}
                            {booking.can_reschedule && (
                                <button className="v-btn v-btn-ghost" onClick={() => setMode("reschedule")}><CalendarClock /> Reschedule</button>
                            )}
                            {booking.can_cancel && (
                                <button className="v-btn v-btn-danger" onClick={() => setMode("cancel")}><XCircle /> Cancel</button>
                            )}
                            {!booking.can_cancel && !booking.can_reschedule && (
                                <span className="v-muted">
                                    Online changes close {booking.policy?.cancellation_window_hours} hours before the appointment. Please contact {booking.business_name}.
                                </span>
                            )}
                        </div>
                    )}

                    {mode === "reschedule" && (
                        <div>
                            <h3 className="v-subheading">Choose a new time</h3>
                            <div className="v-form-grid" style={{ marginBottom: 12 }}>
                                <Field label="Date">
                                    <input type="date" min={todayIn(tz)} max={addDays(todayIn(tz), 90)} value={date} onChange={(e) => { if (e.target.value !== date) { setDate(e.target.value); setSlots(null); } }} />
                                </Field>
                            </div>
                            {slots === null ? (
                                <div className="v-loading"><Loader2 size={18} className="v-spin" /> Loading times...</div>
                            ) : slots.length === 0 ? (
                                <p className="v-muted">No open times on this day. Try another date.</p>
                            ) : (
                                <div className="v-slots">
                                    {slots.map((s) => (
                                        <button key={s.start} className={`v-slot ${newSlot?.start === s.start ? "active" : ""}`} onClick={() => setNewSlot(s)}>{s.label}</button>
                                    ))}
                                </div>
                            )}
                            <div className="bk-actions">
                                <button className="bk-back" onClick={() => setMode("view")}>← Keep current time</button>
                                <button
                                    className="v-btn"
                                    disabled={!newSlot || busy}
                                    onClick={() => newSlot && run(() => rescheduleManagedBooking(token, newSlot.start, booking.staff_id), "Your booking has been moved.")}
                                >
                                    Move to {newSlot ? formatTime(newSlot.start, tz) : "..."}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === "cancel" && (
                        <div>
                            <h3 className="v-subheading">Cancel this booking?</h3>
                            <Field label="Reason (optional)" full>
                                <input value={reason} onChange={(e) => setReason(e.target.value)} />
                            </Field>
                            <div className="bk-actions">
                                <button className="bk-back" onClick={() => setMode("view")}>← Keep my booking</button>
                                <button className="v-btn v-btn-danger" disabled={busy} onClick={() => run(() => cancelManagedBooking(token, reason), "Your booking has been cancelled.")}>
                                    Cancel booking
                                </button>
                            </div>
                        </div>
                    )}

                    {booking.policy?.policy_notes && <div className="bk-policy">{booking.policy.policy_notes}</div>}

                    <h3 className="v-subheading">Message preferences</h3>
                    {prefs === null ? (
                        <button className="v-link" onClick={() => setPrefs({ opt_out_email: false, opt_out_sms: false, opt_out_whatsapp: false })}>
                            Choose which messages you get
                        </button>
                    ) : (
                        <div>
                            <div className="v-chips">
                                {(["email", "sms", "whatsapp"] as const).map((c) => (
                                    <label className="v-check" key={c} style={{ marginRight: 14 }}>
                                        <input type="checkbox" checked={!prefs[`opt_out_${c}`]} onChange={(e) => setPrefs({ ...prefs, [`opt_out_${c}`]: !e.target.checked })} />
                                        {{ email: "Email", sms: "SMS", whatsapp: "WhatsApp" }[c]}
                                    </label>
                                ))}
                            </div>
                            <button
                                className="v-btn v-btn-small"
                                style={{ marginTop: 12 }}
                                onClick={async () => {
                                    try {
                                        await updateManagedPreferences(token, prefs);
                                        setMessage("Your message preferences are saved.");
                                    } catch (err) {
                                        setError(handleApiError(err).message);
                                    }
                                }}
                            >
                                Save preferences
                            </button>
                        </div>
                    )}

                    <div className="bk-actions">
                        <Link className="bk-back" to={`/book/${booking.business_slug || booking.business_id}`}>Book another appointment →</Link>
                    </div>
                </div>
                <div className="bk-footer"><Link to="/" className="bk-powered">Powered by <LogoMark /> <span>velora.</span></Link></div>
            </div>
        </main>
    );
}

export default ManageBooking;
