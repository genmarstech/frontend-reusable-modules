import { useEffect, useState } from "react";
import { getPayments } from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { addDays, formatDateTime, formatMoney, todayIn } from "../../lib/format";
import type { PaymentsReport } from "../../types/bookings";
import { Alert, Avatar, EmptyState, Field, PageHeader, Section, Spinner } from "../../components/ui";
import { InsightsArt } from "../../components/Illustrations";
import { BookingDetailModal } from "./BookingModals";
import { useDashboard } from "./dashboard-context";

const RANGES = [7, 30, 90];

/** Money recorded against bookings: deposits, balances, fees and refunds. */
function PaymentsPage() {
    const { business, timeZone } = useDashboard();
    const today = todayIn(timeZone);
    const [range, setRange] = useState({ date_from: addDays(today, -29), date_to: today });
    const [report, setReport] = useState<PaymentsReport | null>(null);
    const [error, setError] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        getPayments(business.id, range)
            .then((r) => {
                if (!active) return;
                setReport(r);
                setError("");
            })
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [business.id, range, reload]);

    const days = (d: number) => range.date_to === today && range.date_from === addDays(today, -(d - 1));
    const s = report?.summary;

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Payments"
                text="Deposits, balances, fees and refunds you’ve recorded against bookings."
            />

            <div className="v-filters">
                <div className="v-chips">
                    {RANGES.map((d) => (
                        <button
                            key={d}
                            type="button"
                            className={`v-chip ${days(d) ? "active" : ""}`}
                            onClick={() => setRange({ date_from: addDays(today, -(d - 1)), date_to: today })}
                        >
                            {d} days
                        </button>
                    ))}
                </div>
                <Field label="From">
                    <input
                        type="date"
                        className="v-input"
                        value={range.date_from}
                        max={range.date_to}
                        onChange={(e) => e.target.value && setRange({ ...range, date_from: e.target.value })}
                    />
                </Field>
                <Field label="To">
                    <input
                        type="date"
                        className="v-input"
                        value={range.date_to}
                        min={range.date_from}
                        onChange={(e) => e.target.value && setRange({ ...range, date_to: e.target.value })}
                    />
                </Field>
            </div>

            {error && <Alert>{error}</Alert>}

            <section className="v-kpis">
                <div className="v-kpi">
                    <p>Collected</p>
                    <h3>{s ? formatMoney(s.collected) : "–"}</h3>
                    <small>After refunds, {s ? s.count : 0} payments</small>
                </div>
                <div className="v-kpi">
                    <p>Deposits</p>
                    <h3>{s ? formatMoney(s.deposits) : "–"}</h3>
                    <small>Taken to hold bookings</small>
                </div>
                <div className="v-kpi">
                    <p>Refunds</p>
                    <h3>{s ? formatMoney(s.refunds) : "–"}</h3>
                    <small>Paid back to clients</small>
                </div>
                <div className="v-kpi">
                    <p>Still owed</p>
                    <h3>{s ? formatMoney(s.outstanding) : "–"}</h3>
                    <small>On completed and upcoming bookings</small>
                </div>
            </section>

            <Section title="Payment history" badge={report ? `${report.payments.length} shown` : undefined}>
                {!report ? (
                    <Spinner />
                ) : report.payments.length === 0 ? (
                    <EmptyState
                        art={<InsightsArt />}
                        title="No payments in this range"
                        text="Record a payment from a booking (cash, card or mobile money) and it shows up here."
                    />
                ) : (
                    <div className="v-table-wrap">
                        <table className="v-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Type</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                    <th className="v-num">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.payments.map((p) => (
                                    <tr key={p.id} className="v-clickable" onClick={() => setOpenId(p.booking)}>
                                        <td>{formatDateTime(p.created_at, timeZone)}</td>
                                        <td>
                                            <span className="ov-client">
                                                <Avatar name={p.customer_name} size={26} />
                                                {p.customer_name}
                                            </span>
                                        </td>
                                        <td>{p.service_name}</td>
                                        <td>{p.kind_label}</td>
                                        <td>{p.method_label}</td>
                                        <td>{p.reference || "–"}</td>
                                        <td className="v-num">
                                            {p.kind === "refund" ? "−" : ""}
                                            {formatMoney(p.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>

            {openId !== null && (
                <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} onChanged={() => setReload((n) => n + 1)} />
            )}
        </div>
    );
}

export default PaymentsPage;
