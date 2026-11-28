import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { History, Loader2, MessageCircle, RotateCcw, UserRound } from "lucide-react";

import {
    createPublicBooking,
    getPublicAvailability,
    getPublicAvailableDays,
    getPublicBusiness,
    joinWaitlist,
    mediaUrl,
    trackFunnel,
} from "../../lib/api/bookings";
import { getCustomerSession, getMyBookings, logoutCustomer, registerCustomer } from "../../lib/api/customers";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import { formatDayLabel, formatDateTime, formatMoney, todayIn } from "../../lib/format";
import type { PublicBooking, PublicBusiness, PublicService, Slot } from "../../types/bookings";
import type { CustomerSession, FavouriteService } from "../../types/customers";
import { CustomerAuthForm, type AuthMode } from "./CustomerAuth";
import { Alert, Field, PageLoading } from "../../components/ui";
import { LogoMark } from "../../components/Brand";
import { LostArt, SuccessArt } from "../../components/Illustrations";
import { BookingHeroArt, BookingOrnament, BookingPatternArt } from "../../components/CategoryArt";
import { artThemeFor } from "../../lib/artTheme";
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

type Step = "service" | "staff" | "time" | "details" | "account" | "done";

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

    // Customer account: signed-in customers skip the details form and can rebook in a tap.
    const [session, setSession] = useState<CustomerSession | null>(null);
    const [authMode, setAuthMode] = useState<AuthMode>("join");
    const [returnStep, setReturnStep] = useState<Step>("service");
    const [favourites, setFavourites] = useState<FavouriteService[]>([]);
    const [saveAccount, setSaveAccount] = useState(false);
    const [password, setPassword] = useState("");
    const rebookApplied = useRef(false);
    const account = session?.authenticated ? session.account : null;

    /** Remember who is signed in, fill the waitlist fields, and load "book again" suggestions. */
    function applySession(next: CustomerSession, slug: string) {
        setSession(next);
        const acc = next.authenticated ? next.account : null;
        if (!acc) {
            setFavourites([]);
            return;
        }
        setForm((f) => ({ ...f, full_name: acc.full_name, email: acc.email, phone_number: acc.phone_number }));
        getMyBookings(slug)
            .then((res) => setFavourites(res.favourites))
            .catch(() => setFavourites([]));
    }

    useEffect(() => {
        if (!validRef) return;
        let active = true;
        getPublicBusiness(ref)
            .then((b) => {
                if (!active) return;
                setBusiness(b);
                trackFunnel(b.id, "page_view", sessionKey, source);
                // /book/<slug>?rebook=<service>&staff=<id> jumps straight to picking a time.
                const params = new URLSearchParams(window.location.search);
                const again = b.services.find((x) => x.id === Number(params.get("rebook")));
                if (again && !rebookApplied.current) {
                    rebookApplied.current = true;
                    const member = b.staff.find(
                        (m) => m.id === Number(params.get("staff")) && (!m.service_ids.length || m.service_ids.includes(again.id))
                    );
                    setService(again);
                    setStaffId(member ? member.id : null);
                    setStep("time");
                }
            })
            .catch(() => active && setLoadError("This booking page could not be found."));
        return () => {
            active = false;
        };
    }, [ref, validRef, sessionKey, source]);

    useEffect(() => {
        if (!business) return;
        let active = true;
        getCustomerSession(business.slug)
            .then((s) => active && applySession(s, business.slug))
            .catch(() => active && setSession({ authenticated: false, account: null, joined: false }));
        return () => {
            active = false;
        };
    }, [business]);

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

    const rebook = (serviceId: number, staff: number | null) => {
        const s = business.services.find((x) => x.id === serviceId);
        if (!s) return;
        const member = business.staff.find((m) => m.id === staff && (!m.service_ids.length || m.service_ids.includes(s.id)));
        setService(s);
        setStaffId(member ? member.id : null);
        setSlot(null);
        setSlots(null);
        setDays(null);
        setDate("");
        setError("");
        trackFunnel(business.id, "service_selected", sessionKey, source);
        setStep("time");
    };

    const openAuth = (mode: AuthMode) => {
        setAuthMode(mode);
        setReturnStep(step === "account" ? returnStep : step);
        setError("");
        setStep("account");
    };

    const signedIn = (next: CustomerSession) => {
        applySession(next, business.slug);
        setStep(returnStep === "done" ? "service" : returnStep);
    };

    const signOut = async () => {
        try {
            setSession(await logoutCustomer());
        } catch {
            setSession({ authenticated: false, account: null, joined: false });
        }
        setForm({ full_name: "", email: "", phone_number: "", intake_notes: form.intake_notes, preferred_channel: "" });
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
        if (!account) {
            if (!form.full_name.trim()) missing.full_name = "Please enter your name.";
            if (!form.phone_number.trim()) missing.phone_number = "Please enter your phone number.";
            if (!form.email.trim()) missing.email = "Please enter your email so we can send your confirmation.";
            if (saveAccount && password.length < 8) missing.password = "Use at least 8 characters.";
        }
        if (Object.keys(missing).length) {
            setErrors(missing);
            return;
        }
        setSubmitting(true);
        trackFunnel(business.id, "details_submitted", sessionKey, source);
        let signedInNow = Boolean(account);
        try {
            if (!account && saveAccount) {
                // Join first, so this booking is saved to their new account.
                const next = await registerCustomer({
                    business: business.slug,
                    full_name: form.full_name.trim(),
                    phone_number: form.phone_number.trim(),
                    email: form.email.trim(),
                    password,
                });
                applySession(next, business.slug);
                setPassword("");
                signedInNow = true;
            }
            const created = await createPublicBooking(business.id, {
                service: service.id,
                staff: staffId,
                start: slot.start,
                ...(signedInNow
                    ? {}
                    : {
                          full_name: form.full_name.trim(),
                          email: form.email.trim(),
                          phone_number: form.phone_number.trim(),
                      }),
                intake_notes: form.intake_notes.trim(),
                preferred_channel: form.preferred_channel,
                session_key: sessionKey,
                source,
            });
            setBooking(created);
            setStep("done");
            if (signedInNow) {
                getMyBookings(business.slug).then((res) => setFavourites(res.favourites)).catch(() => undefined);
            }
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

    const stepIndex = { service: 0, staff: 1, time: 2, details: 3, account: 3, done: 4 }[step];
    const logo = mediaUrl(business.business_logo);
    const staffName = staffId ? business.staff.find((m) => m.id === staffId)?.staff_name : null;
    const artTheme = artThemeFor(business.business_category);

    return (
        <main className="bk-page">
            <BookingPatternArt theme={artTheme} className="bk-pattern" />
            <section className="bk-hero">
                <BookingHeroArt theme={artTheme} className="bk-hero-art bk-hero-art-left" />
                <BookingHeroArt theme={artTheme} className="bk-hero-art" />
                <div className="bk-hero-inner">
                    <div className="bk-hero-logo">{logo ? <img src={logo} alt="" /> : business.business_name.charAt(0)}</div>
                    <div>
                        <span className="bk-eyebrow">{CATEGORY_LABELS[business.business_category] || business.business_category_label} · Book online</span>
                        <h1>{business.business_name}</h1>
                        <p>{business.business_description}</p>
                    </div>
                    <div className="bk-account">
                        {business.chat_links?.whatsapp && (
                            <a className="bk-account-link" href={business.chat_links.whatsapp} target="_blank" rel="noreferrer">
                                <MessageCircle size={14} /> Book on WhatsApp
                            </a>
                        )}
                        {account ? (
                            <>
                                <span className="bk-account-name"><UserRound size={14} /> Hi, {account.first_name}</span>
                                <Link to={`/book/${business.slug}/account`} className="bk-account-link"><History size={14} /> My bookings</Link>
                                <button type="button" className="bk-account-link" onClick={signOut}>Sign out</button>
                            </>
                        ) : (
                            session && step !== "account" && (
                                <button type="button" className="bk-account-link" onClick={() => openAuth("signin")}>
                                    <UserRound size={14} /> Sign in
                                </button>
                            )
                        )}
                    </div>
                </div>
            </section>

            <div className="bk-container">
                <div className="bk-card">
                    <div className="bk-steps">
                        {[0, 1, 2, 3].map((i) => <span key={i} className={i <= stepIndex ? "done" : ""} />)}
                    </div>

                    {step !== "done" && <Alert>{error}</Alert>}

                    {step === "account" && (
                        <CustomerAuthForm
                            businessSlug={business.slug}
                            businessName={business.business_name}
                            initialMode={authMode}
                            onDone={signedIn}
                            onCancel={() => setStep(returnStep)}
                        />
                    )}

                    {step === "service" && (
                        <>
                            {account && favourites.length > 0 && (
                                <div className="bk-again">
                                    <h3><RotateCcw size={15} /> Book again</h3>
                                    <div className="bk-again-list">
                                        {favourites.map((f) => (
                                            <button key={`${f.service}-${f.staff}`} type="button" className="bk-again-item" onClick={() => rebook(f.service, f.staff)}>
                                                <strong>{f.service_name}</strong>
                                                <small>{f.staff_name ? `with ${f.staff_name} · ` : ""}{formatMoney(f.price)}</small>
                                                <span>Pick a time →</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {session && !account && (
                                <div className="bk-join">
                                    <div>
                                        <strong>Book faster as a {business.business_name} client</strong>
                                        <small>Save your details once and rebook your favourite service in one tap.</small>
                                    </div>
                                    <div className="bk-join-actions">
                                        <button type="button" className="v-btn v-btn-small" onClick={() => openAuth("join")}>Join</button>
                                        <button type="button" className="bk-back" onClick={() => openAuth("signin")}>Sign in</button>
                                    </div>
                                </div>
                            )}
                            <h2>Choose a service</h2>
                            <p>Pick what you would like to book.</p>
                            {business.services.length === 0 || business.accepting_bookings === false ? (
                                <div className="bk-closed">
                                    <strong>{business.business_name} is not taking online bookings yet.</strong>
                                    <span>
                                        They are still setting up their booking page.
                                        {business.whatsapp_number && (
                                            <> Message them on <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a> to book.</>
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <div className="bk-options">
                                    {business.services.map((s) => (
                                        <button key={s.id} type="button" className={`bk-option ${service?.id === s.id ? "active" : ""}`} onClick={() => chooseService(s)} disabled={s.bookable === false}>
                                            <div>
                                                <strong>{s.service_name}</strong>
                                                <small>
                                                    {s.bookable === false
                                                        ? "Not bookable online yet"
                                                        : `${s.duration_minutes} min${s.service_description ? ` · ${s.service_description}` : ""}`}
                                                </small>
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
                                            <button key={d.date} type="button" className={`bk-day ${date === d.date ? "active" : ""}`} onClick={() => { if (d.date !== date) { setDate(d.date); setSlots(null); setWaitlisted(false); } }}>
                                                <small>{dt.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</small>
                                                <strong>{dd}</strong>
                                                <em>{d.available ? `${d.available} open` : "Full"}</em>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {days && days.length > 0 && days.every((d) => d.available === 0) && (
                                <div className="bk-closed">
                                    <strong>No open times in the next {days.length} days.</strong>
                                    <span>
                                        {business.business_name} has no free times for {service.service_name} right now.
                                        {business.whatsapp_number && (
                                            <> Message them on <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>, or join the waitlist below.</>
                                        )}
                                    </span>
                                </div>
                            )}
                            {date && (
                                <>
                                    <h3 className="v-subheading" style={{ marginTop: 0 }}>{formatDayLabel(date)}</h3>
                                    {slots === null ? (
                                        <div className="v-loading"><Loader2 size={18} className="v-spin" /> Loading times...</div>
                                    ) : slots.length === 0 ? (
                                        waitlisted ? (
                                            <Alert kind="success">You are on the waitlist for {formatDayLabel(date)}. We will message you if a slot opens. This is not a booking yet.</Alert>
                                        ) : (
                                            <div className="bk-policy">
                                                No open times on this day. Pick another day, or join the waitlist and we will message you if something opens up. The waitlist is not a booking.
                                                {!account && (
                                                    <div className="v-form-grid v-form-grid-3" style={{ marginTop: 12 }}>
                                                        <input className="v-input" placeholder="Your name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                                                        <input className="v-input" type="tel" placeholder="Phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                                                        <input className="v-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                                    </div>
                                                )}
                                                <button className="v-btn v-btn-small" style={{ marginTop: 10 }} onClick={addToWaitlist}>Join the waitlist for {formatDayLabel(date)}</button>
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
                            <h2>{account ? "Confirm your booking" : "Your details"}</h2>
                            <p>{account ? `${business.business_name} will confirm it and you'll get a message.` : "We will send your confirmation and reminders here."}</p>
                            <dl className="bk-summary">
                                <div><dt>Service</dt><dd>{service.service_name}</dd></div>
                                <div><dt>When</dt><dd>{formatDateTime(slot.start, timeZone)}</dd></div>
                                <div><dt>With</dt><dd>{staffName || "Any available team member"}</dd></div>
                                <div><dt>Price</dt><dd>{formatMoney(service.price)}{deposit > 0 && ` · deposit ${formatMoney(deposit)}`}</dd></div>
                            </dl>
                            {account ? (
                                <div className="v-form-grid">
                                    <div className="bk-booking-as v-field-full">
                                        <UserRound size={16} />
                                        <span>
                                            Booking as <strong>{account.full_name}</strong> · {account.phone_number}
                                            {account.email ? ` · ${account.email}` : ""}
                                        </span>
                                        <button type="button" className="bk-back" onClick={signOut}>Not you?</button>
                                    </div>
                                    <Field label="Anything we should know?" full error={errors.intake_notes}>
                                        <textarea placeholder="Allergies, hair type, preferences..." value={form.intake_notes} onChange={(e) => setForm({ ...form, intake_notes: e.target.value })} />
                                    </Field>
                                </div>
                            ) : (
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
                                <div className="bk-save-account v-field-full">
                                    <label className="bk-check">
                                        <input type="checkbox" checked={saveAccount} onChange={(e) => setSaveAccount(e.target.checked)} />
                                        <span>
                                            <strong>Save my details and join {business.business_name}</strong>
                                            <small>Next time, rebook in one tap. You sign in with your phone number.</small>
                                        </span>
                                    </label>
                                    {saveAccount && (
                                        <Field label="Choose a password" error={errors.password} hint="At least 8 characters.">
                                            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </Field>
                                    )}
                                    <p className="v-hint">
                                        Already a client? <button type="button" className="bk-link" onClick={() => openAuth("signin")}>Sign in</button>
                                    </p>
                                </div>
                            </div>
                            )}
                            <div className="bk-actions">
                                <button type="button" className="bk-back" onClick={() => setStep("time")}>← Change time</button>
                                <button type="submit" className="v-btn" disabled={submitting || (!account && !form.full_name.trim())}>
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
                            <div className="bk-done-actions">
                                <Link className="v-btn" to={`/manage/${booking.manage_token}`}>View or change booking</Link>
                                {account && (
                                    <Link className="v-btn v-btn-ghost" to={`/book/${business.slug}/account`}>All my bookings</Link>
                                )}
                            </div>
                            <p className="v-hint" style={{ marginTop: 12 }}>
                                {account
                                    ? "Your bookings are saved to your account. Sign in any time to rebook in a tap."
                                    : "Save this link: you can reschedule or cancel from it."}
                            </p>
                        </div>
                    )}

                    {step !== "done" && step !== "account" && <BookingOrnament theme={artTheme} className="bk-ornament" />}
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
