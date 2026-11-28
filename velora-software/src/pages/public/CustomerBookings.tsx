import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CalendarDays, LogOut, RotateCcw } from "lucide-react";

import { getPublicBusiness, mediaUrl } from "../../lib/api/bookings";
import { getCustomerSession, getMyBookings, joinBusiness, logoutCustomer } from "../../lib/api/customers";
import { handleApiError } from "../../lib/api/handleErrors";
import { formatDateTime, formatMoney } from "../../lib/format";
import type { PublicBusiness } from "../../types/bookings";
import type { CustomerBooking, CustomerBookings as Bookings, CustomerSession } from "../../types/customers";
import { Alert, EmptyState, PageLoading, StatusBadge } from "../../components/ui";
import { LogoMark } from "../../components/Brand";
import { BookingArt, LostArt } from "../../components/Illustrations";
import StatusPage from "../../components/StatusPage";
import { usePageMeta } from "../../lib/usePageMeta";
import { CustomerAuthForm } from "./CustomerAuth";
import "../../styles/dashboard.css";
import "../../styles/booking.css";

/** /book/<slug>/account: a customer's bookings at one business, with one-tap rebooking. */
function CustomerBookings() {
    const { businessRef = "" } = useParams<{ businessRef: string }>();
    const ref = businessRef.trim().toLowerCase();
    const navigate = useNavigate();
    const [business, setBusiness] = useState<PublicBusiness | null>(null);
    const [session, setSession] = useState<CustomerSession | null>(null);
    const [bookings, setBookings] = useState<Bookings | null>(null);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");
    usePageMeta(business ? `My bookings · ${business.business_name}` : "My bookings");

    const load = useCallback(async (slug: string) => {
        try {
            setBookings(await getMyBookings(slug));
        } catch (err) {
            setError(handleApiError(err).message);
        }
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([getPublicBusiness(ref), getCustomerSession(ref)])
            .then(([b, s]) => {
                if (!active) return;
                setBusiness(b);
                setSession(s);
                if (s.authenticated && s.joined) load(b.slug);
                if (b.slug !== businessRef) navigate(`/book/${b.slug}/account`, { replace: true });
            })
            .catch(() => active && setLoadError("This booking page could not be found."));
        return () => {
            active = false;
        };
    }, [ref, businessRef, navigate, load]);

    const signedIn = (next: CustomerSession) => {
        setSession(next);
        if (business && next.authenticated && next.joined) load(business.slug);
    };

    if (loadError) {
        return (
            <StatusPage art={<LostArt />} title="Booking page not found" text="This link may have changed. Ask the business for their latest link.">
                <Link to="/" className="v-btn">Go to Velora</Link>
            </StatusPage>
        );
    }
    if (!business || !session) return <PageLoading label="Loading your bookings..." />;

    const logo = mediaUrl(business.business_logo);
    const timeZone = business.policy.timezone || "Africa/Nairobi";
    const account = session.authenticated ? session.account : null;

    const rebookLink = (b: { service: number; staff: number | null }) =>
        `/book/${business.slug}?rebook=${b.service}${b.staff ? `&staff=${b.staff}` : ""}`;

    const signOut = async () => {
        setSession(await logoutCustomer().catch(() => ({ authenticated: false, account: null, joined: false })));
        setBookings(null);
    };

    const join = async () => {
        try {
            setSession(await joinBusiness(business.slug));
            await load(business.slug);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    const row = (b: CustomerBooking, past: boolean) => (
        <li key={b.manage_token} className="bk-history-item">
            <div>
                <strong>{b.service_name}</strong>
                <small>
                    {formatDateTime(b.start, timeZone)}
                    {b.staff_name ? ` · with ${b.staff_name}` : ""} · {formatMoney(b.price)}
                </small>
            </div>
            <StatusBadge status={b.status} />
            <div className="bk-history-actions">
                {past ? (
                    b.rebook.available ? (
                        <Link className="v-btn v-btn-small" to={rebookLink(b.rebook)}>
                            <RotateCcw size={14} /> Book again
                        </Link>
                    ) : (
                        <small className="v-muted">No longer offered</small>
                    )
                ) : (
                    <Link className="v-btn v-btn-small v-btn-ghost" to={`/manage/${b.manage_token}`}>Manage</Link>
                )}
            </div>
        </li>
    );

    return (
        <main className="bk-page">
            <section className="bk-hero">
                <div className="bk-hero-inner">
                    <div className="bk-hero-logo">{logo ? <img src={logo} alt="" /> : business.business_name.charAt(0)}</div>
                    <div>
                        <span className="bk-eyebrow">My bookings</span>
                        <h1>{business.business_name}</h1>
                        {account && <p>Signed in as {account.full_name} · {account.phone_number}</p>}
                    </div>
                    {account && (
                        <div className="bk-account">
                            <button type="button" className="bk-account-link" onClick={signOut}><LogOut size={14} /> Sign out</button>
                        </div>
                    )}
                </div>
            </section>

            <div className="bk-container">
                <div className="bk-card">
                    <Alert>{error}</Alert>
                    {!account ? (
                        <CustomerAuthForm
                            businessSlug={business.slug}
                            businessName={business.business_name}
                            initialMode="signin"
                            onDone={signedIn}
                            onCancel={() => navigate(`/book/${business.slug}`)}
                        />
                    ) : !session.joined ? (
                        <EmptyState
                            art={<BookingArt />}
                            title={`Join ${business.business_name}`}
                            text="You have a Velora account but have not booked here yet. Join to keep your bookings here in one place."
                            action={<button type="button" className="v-btn" onClick={join}>Join {business.business_name}</button>}
                        />
                    ) : !bookings ? (
                        <PageLoading label="Loading your bookings..." />
                    ) : (
                        <>
                            {bookings.favourites.length > 0 && (
                                <div className="bk-again">
                                    <h3><RotateCcw size={15} /> Book again</h3>
                                    <div className="bk-again-list">
                                        {bookings.favourites.map((f) => (
                                            <Link key={`${f.service}-${f.staff}`} className="bk-again-item" to={rebookLink(f)}>
                                                <strong>{f.service_name}</strong>
                                                <small>{f.staff_name ? `with ${f.staff_name} · ` : ""}{formatMoney(f.price)}</small>
                                                <span>Pick a time →</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bk-history-head">
                                <h2>Upcoming</h2>
                                <Link to={`/book/${business.slug}`} className="v-btn v-btn-small"><CalendarDays size={14} /> New booking</Link>
                            </div>
                            {bookings.upcoming.length === 0 ? (
                                <p className="v-muted">No upcoming bookings.</p>
                            ) : (
                                <ul className="bk-history">{bookings.upcoming.map((b) => row(b, false))}</ul>
                            )}

                            <h2 className="bk-history-title">Past visits</h2>
                            {bookings.past.length === 0 ? (
                                <p className="v-muted">Your past visits will show here, ready to rebook.</p>
                            ) : (
                                <ul className="bk-history">{bookings.past.map((b) => row(b, true))}</ul>
                            )}
                        </>
                    )}
                </div>

                <div className="bk-footer">
                    <Link to={`/book/${business.slug}`}>Back to {business.business_name}</Link>
                    <br />
                    <Link to="/" className="bk-powered">Powered by <LogoMark /> <span>velora.</span></Link>
                </div>
            </div>
        </main>
    );
}

export default CustomerBookings;
