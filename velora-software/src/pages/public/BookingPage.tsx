import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";

import {
    createPublicBooking,
    getPublicAvailability,
    getPublicAvailableDays,
    getPublicBusiness,
    joinWaitlist,
    mediaUrl,
    trackFunnel,
} from "../../lib/api/bookings";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import { formatDayLabel, formatDateTime, formatMoney, todayIn } from "../../lib/format";
import type { PublicBooking, PublicBusiness, PublicService, Slot } from "../../types/bookings";
import { Alert, Field, PageLoading } from "../../components/ui";
import { LogoMark } from "../../components/Brand";
import { LostArt, SuccessArt } from "../../components/Illustrations";
import StatusPage from "../../components/StatusPage";
import { usePageMeta } from "../../lib/usePageMeta";
import { CATEGORY_LABELS } from "../../types/business";
import "../../styles/dashboard.css";
import "../../styles/booking.css";

function getSessionKey(): string {
    const make = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
        const existing = sessionStorage.getItem("velora.bk.session");
        if (existing) return existing;
        const key = make();
        sessionStorage.setItem("velora.bk.session", key);
        return key;
    } catch {
        return make();
    }
}

function detectSource(param: string | null): string {
    if (param) return param.slice(0, 40);
    try {
        const ref = document.referrer ? new URL(document.referrer).hostname : "";
        if (!ref || ref === window.location.hostname) return "direct";
        if (ref.includes("instagram")) return "instagram";
        if (ref.includes("facebook")) return "facebook";
        if (ref.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
        if (ref.includes("google")) return "google";
        return ref.slice(0, 40);
    } catch {
        return "direct";
    }
}

type Step = "service" | "staff" | "time" | "details" | "done";

function BookingPage() {
    // The link is /book/<slug>; older /book/<id> links still load and are
    // swapped for the slug in the address bar.
    const { businessRef = "" } = useParams<{ businessRef: string }>();
    const ref = businessRef.trim().toLowerCase();
    const validRef = /^[a-z0-9-]+$/.test(ref);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const sessionKey = useMemo(() => getSessionKey(), []);
    const source = useMemo(() => detectSource(searchParams.get("source")), [searchParams]);

    const [business, setBusiness] = useState<PublicBusiness | null>(null);
    const [loadError, setLoadError] = useState("");
    const [step, setStep] = useState<Step>("service");

    const [service, setService] = useState<PublicService | null>(null);
    const [staffId, setStaffId] = useState<number | null>(null);
    const [date, setDate] = useState("");
    const [days, setDays] = useState<{ date: string; available: number }[] | null>(null);
    const [slots, setSlots] = useState<Slot[] | null>(null);
    const [slot, setSlot] = useState<Slot | null>(null);

    const [form, setForm] = useState({ full_name: "", email: "", phone_number: "", intake_notes: "", preferred_channel: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState<PublicBooking | null>(null);
    usePageMeta(
        business ? `Book at ${business.business_name}` : "Book an appointment",
        business ? business.business_description || `Book your next appointment at ${business.business_name} online.` : undefined
    );
    const [waitlisted, setWaitlisted] = useState(false);

    useEffect(() => {
        if (!validRef) return;
        let active = true;
        getPublicBusiness(ref)
            .then((b) => {
                if (!active) return;
                setBusiness(b);
                trackFunnel(b.id, "page_view", sessionKey, source);
            })
            .catch(() => active && setLoadError("This booking page could not be found."));
        return () => {
            active = false;
        };
    }, [ref, validRef, sessionKey, source]);

    useEffect(() => {
        if (business?.slug && businessRef !== business.slug) {
            navigate(`/book/${business.slug}${location.search}`, { replace: true });
        }
    }, [business, businessRef, location.search, navigate]);

    const timeZone = business?.policy.timezone || "Africa/Nairobi";

    const staffForService = useMemo(
        () => (business && service ? business.staff.filter((m) => !m.service_ids.length || m.service_ids.includes(service.id)) : []),
        [business, service]
    );

    // Days with open slots for the chosen service/staff.
    useEffect(() => {
        if (!business || !service || step !== "time") return;
        let active = true;
        getPublicAvailableDays(business.id, {
            service: service.id,
            staff: staffId,
            from: todayIn(timeZone),
            days: Math.min(21, business.policy.max_advance_days + 1),
        })
            .then((res) => {
                if (!active) return;
                setDays(res.days);
                setDate((current) => current || res.days.find((d) => d.available > 0)?.date || res.days[0]?.date || "");
            })
            .catch(() => active && setDays([]));
        return () => {
            active = false;
        };
    }, [business, service, staffId, step, timeZone]);

    useEffect(() => {
        if (!business || !service || !date || step !== "time") return;
        let active = true;
        getPublicAvailability(business.id, { service: service.id, staff: staffId, date })
            .then((res) => active && setSlots(res.slots))
            .catch(() => active && setSlots([]));
        return () => {
            active = false;
        };
    }, [business, service, staffId, date, step]);

    if (loadError || !validRef) {
        return (
            <StatusPage
                art={<LostArt />}
                title="Booking page not found"
                text="This booking link may have changed. Ask the business for their latest link, or check it for typos."
            >
                <Link to="/" className="v-btn">Go to Velora</Link>
            </StatusPage>
        );
    }

    if (!business) {
        return (
<PageLoading label="Loading booking page..." />
        );
    }

    const chooseService = (s: PublicService) => {
        setService(s);
        setSlot(null);
        setSlots(null);
        setDays(null);
        setDate("");
        trackFunnel(business.id, "service_selected", sessionKey, source);
        const eligible = business.staff.filter((m) => !m.service_ids.length || m.service_ids.includes(s.id));
        if (eligible.length <= 1) {
            setStaffId(null);
            setStep("time");
        } else {
            setStep("staff");
        }
    };

    const chooseSlot = (s: Slot) => {
        setSlot(s);
        trackFunnel(business.id, "slot_selected", sessionKey, source);
        setStep("details");
    };

    const deposit = service
        ? service.deposit_amount !== null && business.policy.deposit_required
            ? Number(service.deposit_amount)
            : business.policy.deposit_required
              ? (Number(service.price) * Number(business.policy.deposit_percentage)) / 100
              : 0
        : 0;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!service || !slot) return;
        setErrors({});
        setError("");
        const missing: Record<string, string> = {};
        if (!form.full_name.trim()) missing.full_name = "Please enter your name.";
        if (!form.phone_number.trim()) missing.phone_number = "Please enter your phone number.";
        if (!form.email.trim()) missing.email = "Please enter your email so we can send your confirmation.";
        if (Object.keys(missing).length) {
            setErrors(missing);
            return;
        }
        setSubmitting(true);
        trackFunnel(business.id, "details_submitted", sessionKey, source);
        try {
            const created = await createPublicBooking(business.id, {
                service: service.id,
                staff: staffId,
                start: slot.start,
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone_number: form.phone_number.trim(),
                intake_notes: form.intake_notes.trim(),
                preferred_channel: form.preferred_channel,
                session_key: sessionKey,
                source,
            });
            setBooking(created);
            setStep("done");
        } catch (err) {
            const apiError = handleApiError(err);
            setErrors(fieldErrorsFrom(err));
            setError(apiError.message);
            if (apiError.status === 409) {
                // Someone else took the slot; send them back to pick another.
                setSlot(null);
                setSlots(null);
                setStep("time");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const addToWaitlist = async () => {
        if (!service || !date) return;
        if (!form.full_name.trim() || (!form.email.trim() && !form.phone_number.trim())) {
            setError("Enter your name and an email or phone number below to join the waitlist.");
            return;
        }
        try {
            await joinWaitlist(business.id, {
                service: service.id,
                staff: staffId,
                desired_date: date,
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone_number: form.phone_number.trim(),
            });
            setWaitlisted(true);
            setError("");
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    const stepIndex = { service: 0, staff: 1, time: 2, details: 3, done: 4 }[step];
    const logo = mediaUrl(business.business_logo);
    const staffName = staffId ? business.staff.find((m) => m.id === staffId)?.staff_name : null;

    return (
        <main className="bk-page">
            <section className="bk-hero">
                <div className="bk-hero-inner">
                    <div className="bk-hero-logo">{logo ? <img src={logo} alt="" /> : business.business_name.charAt(0)}</div>
                    <div>
                        <span className="bk-eyebrow">{CATEGORY_LABELS[business.business_category] || business.business_category_label} · Book online</span>
                        <h1>{business.business_name}</h1>
                        <p>{business.business_description}</p>
                    </div>
                </div>
            </section>

            <div className="bk-container">
                <div className="bk-card">
                    <div className="bk-steps">
                        {[0, 1, 2, 3].map((i) => <span key={i} className={i <= stepIndex ? "done" : ""} />)}
                    </div>

                    {step !== "done" && <Alert>{error}</Alert>}

                    {step === "service" && (
                        <>
                            <h2>Choose a service</h2>
                            <p>Pick what you would like to book.</p>
                            {business.services.length === 0 ? (
                                <p className="v-muted">This business has not opened online booking yet.</p>
                            ) : (
                                <div className="bk-options">
                                    {business.services.map((s) => (
                                        <button key={s.id} type="button" className={`bk-option ${service?.id === s.id ? "active" : ""}`} onClick={() => chooseService(s)}>
                                            <div>
                                                <strong>{s.service_name}</strong>
                                                <small>{s.duration_minutes} min{s.service_description ? ` · ${s.service_description}` : ""}</small>
                                            </div>
                                            <span className="bk-price">{formatMoney(s.price)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {step === "staff" && service && (
                        <>
                            <h2>Who would you like?</h2>
                            <p>{service.service_name} · {service.duration_minutes} min</p>
                            <div className="bk-options">
                                <button type="button" className="bk-option" onClick={() => { setStaffId(null); setStep("time"); }}>
                                    <div><strong>Anyone available</strong><small>Shows the most open times</small></div>
                                </button>
                                {staffForService.map((m) => (
                                    <button key={m.id} type="button" className={`bk-option ${staffId === m.id ? "active" : ""}`} onClick={() => { setStaffId(m.id); setStep("time"); }}>
                                        <div><strong>{m.staff_name}</strong></div>
                                    </button>
                                ))}
                            </div>
                            <div className="bk-actions"><button className="bk-back" onClick={() => setStep("service")}>← Back</button></div>
                        </>
                    )}

                    {step === "time" && service && (
                        <>
                            <h2>Pick a time</h2>
                            <p>{service.service_name}{staffName ? ` with ${staffName}` : ""} · times shown in {timeZone.replace("_", " ")}</p>
                            {days === null ? (
                                <div className="v-loading"><Loader2 size={18} className="v-spin" /> Finding open days...</div>
                            ) : (
                                <div className="bk-days">
                                    {days.map((d) => {
                                        const [y, m, dd] = d.date.split("-").map(Number);
                                        const dt = new Date(Date.UTC(y, m - 1, dd));
                                        return (
                                            <button key={d.date} type="button" className={`bk-day ${date === d.date ? "active" : ""}`} onClick={() => { if (d.date !== date) { setDate(d.date); setSlots(null); } }}>
                                                <small>{dt.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</small>
                                                <strong>{dd}</strong>
                                                <em>{d.available ? `${d.available} open` : "None"}</em>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {date && (
                                <>
                                    <h3 className="v-subheading" style={{ marginTop: 0 }}>{formatDayLabel(date)}</h3>
                                    {slots === null ? (
                                        <div className="v-loading"><Loader2 size={18} className="v-spin" /> Loading times...</div>
                                    ) : slots.length === 0 ? (
                                        waitlisted ? (
                                            <Alert kind="success">You are on the waitlist. We will message you if a slot opens on this day.</Alert>
                                        ) : (
                                            <div className="bk-policy">
                                                No open times on this day. Pick another day, or join the waitlist and we will message you if something opens up.
                                                <div className="v-form-grid v-form-grid-3" style={{ marginTop: 12 }}>
                                                    <input className="v-input" placeholder="Your name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                                                    <input className="v-input" type="tel" placeholder="Phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                                                    <input className="v-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                                </div>
                                                <button className="v-btn v-btn-small" style={{ marginTop: 10 }} onClick={addToWaitlist}>Join the waitlist</button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="v-slots">
                                            {slots.map((s) => (
                                                <button key={s.start} type="button" className={`v-slot ${slot?.start === s.start ? "active" : ""}`} onClick={() => chooseSlot(s)}>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="bk-actions">
                                <button className="bk-back" onClick={() => setStep(staffForService.length > 1 ? "staff" : "service")}>← Back</button>
                            </div>
                        </>
                    )}

                    {step === "details" && service && slot && (
                        <form onSubmit={submit} noValidate>
                            <h2>Your details</h2>
                            <p>We will send your confirmation and reminders here.</p>
                            <dl className="bk-summary">
                                <div><dt>Service</dt><dd>{service.service_name}</dd></div>
                                <div><dt>When</dt><dd>{formatDateTime(slot.start, timeZone)}</dd></div>
                                <div><dt>With</dt><dd>{staffName || "Any available team member"}</dd></div>
                                <div><dt>Price</dt><dd>{formatMoney(service.price)}{deposit > 0 && ` · deposit ${formatMoney(deposit)}`}</dd></div>
                            </dl>
                            <div className="v-form-grid">
                                <Field label="Full name" error={errors.full_name}>
                                    <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} autoComplete="name" required />
                                </Field>
                                <Field label="Phone number" error={errors.phone_number}>
                                    <input type="tel" placeholder="+254 7XX XXX XXX" autoComplete="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
                                </Field>
                                <Field label="Email" error={errors.email}>
                                    <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                </Field>
                                <Field label="Where should we message you?">
                                    <select value={form.preferred_channel} onChange={(e) => setForm({ ...form, preferred_channel: e.target.value })}>
                                        <option value="">However the business prefers</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="sms">SMS</option>
                                        <option value="email">Email</option>
                                    </select>
                                </Field>
                                <Field label="Anything we should know?" full error={errors.intake_notes}>
                                    <textarea placeholder="Allergies, hair type, preferences..." value={form.intake_notes} onChange={(e) => setForm({ ...form, intake_notes: e.target.value })} />
                                </Field>
                            </div>
                            <div className="bk-actions">
                                <button type="button" className="bk-back" onClick={() => setStep("time")}>← Change time</button>
                                <button type="submit" className="v-btn" disabled={submitting || !form.full_name.trim()}>
                                    {submitting ? "Booking..." : deposit > 0 ? "Reserve my slot" : "Confirm booking"}
                                </button>
                            </div>
                            <Policy business={business} />
                        </form>
                    )}

                    {step === "done" && booking && (
                        <div className="bk-success">
                            <SuccessArt className="bk-success-art" />
                            <h2>
                                {booking.status === "confirmed" ? "You're booked!" : booking.status === "held" ? "Your slot is on hold" : "Request received"}
                            </h2>
                            <p className="bk-sub">
                                {booking.status === "confirmed"
                                    ? "We've sent your confirmation. You'll get a reminder before your visit."
                                    : booking.status === "held"
                                      ? `Pay the deposit of ${formatMoney(booking.deposit_amount)} to confirm. ${business.business_name} will share how to pay.`
                                      : `${business.business_name} will confirm your booking shortly.`}
                            </p>
                            <dl className="bk-summary" style={{ textAlign: "left" }}>
                                <div><dt>Service</dt><dd>{booking.service_name}</dd></div>
                                <div><dt>When</dt><dd>{formatDateTime(booking.start, timeZone)}</dd></div>
                                <div><dt>With</dt><dd>{booking.staff_name || "Our team"}</dd></div>
                                <div><dt>Price</dt><dd>{formatMoney(booking.price)}</dd></div>
                            </dl>
                            <Link className="v-btn" to={`/manage/${booking.manage_token}`}>View or change booking</Link>
                            <p className="v-hint" style={{ marginTop: 12 }}>Save this link: you can reschedule or cancel from it.</p>
                        </div>
                    )}
                </div>

                <div className="bk-footer">
                    Questions? {business.whatsapp_number && <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp {business.business_name}</a>}
                    <br />
                    <Link to="/" className="bk-powered">Powered by <LogoMark /> <span>velora.</span></Link>
                </div>
            </div>
        </main>
    );
}

export function Policy({ business }: { business: Pick<PublicBusiness, "policy"> }) {
    const p = business.policy;
    return (
        <div className="bk-policy">
            You can cancel or reschedule online up to {p.cancellation_window_hours} hours before your appointment.
            {Number(p.cancellation_fee_percentage) > 0 && ` Late cancellations and missed appointments may be charged ${Number(p.cancellation_fee_percentage)}%.`}
            {p.late_arrival_grace_minutes > 0 && ` Please arrive on time; we can hold your slot for ${p.late_arrival_grace_minutes} minutes.`}
            {p.policy_notes && <><br />{p.policy_notes}</>}
        </div>
    );
}

export default BookingPage;
