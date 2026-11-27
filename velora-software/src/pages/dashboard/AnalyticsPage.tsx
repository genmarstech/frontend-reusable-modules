import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";

import { downloadAnalyticsCsv, getAnalytics } from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { addDays, formatMoney, todayIn } from "../../lib/format";
import type { AnalyticsReport } from "../../types/bookings";
import { Alert, Field, PageHeader, Section, Spinner } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

const RANGES = [
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
];

function Bars({ rows, format = (v: number) => String(v) }: { rows: { label: string; value: number }[]; format?: (v: number) => string }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    if (rows.length === 0) return <p className="v-muted">No data in this range.</p>;
    return (
        <div className="v-bars">
            {rows.map((r) => (
                <div className="v-bar-row" key={r.label}>
                    <span title={r.label}>{r.label}</span>
                    <div className="v-bar-track"><div className="v-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
                    <span className="v-num">{format(r.value)}</span>
                </div>
            ))}
        </div>
    );
}

function Kpi({ label, value, note }: { label: string; value: string | number; note?: string }) {
    return (
        <div className="v-kpi">
            <p>{label}</p>
            <h3>{value}</h3>
            {note && <small>{note}</small>}
        </div>
    );
}

function AnalyticsPage() {
    const { business, staff, services, timeZone } = useDashboard();
    const today = todayIn(timeZone);
    const [filters, setFilters] = useState({ date_from: addDays(today, -29), date_to: today, staff: "", service: "" });
    const [report, setReport] = useState<AnalyticsReport | null>(null);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        let active = true;
        getAnalytics(business.id, filters)
            .then((r) => {
                if (!active) return;
                setReport(r);
                setError("");
            })
            .catch((err) => active && setError(handleApiError(err).message));
        return () => {
            active = false;
        };
    }, [business.id, filters]);

    const exportCsv = async (kind: "bookings" | "summary") => {
        setExporting(true);
        try {
            await downloadAnalyticsCsv(business.id, filters, kind);
        } catch (err) {
            setError(handleApiError(err).message);
        } finally {
            setExporting(false);
        }
    };

    const r = report;

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Analytics"
                text="Bookings, attendance, capacity, revenue and customer loyalty."
                actions={
                    <>
                        <button className="v-btn v-btn-ghost" disabled={exporting} onClick={() => exportCsv("bookings")}><Download /> Bookings CSV</button>
                        <button className="v-btn v-btn-ghost" disabled={exporting} onClick={() => exportCsv("summary")}><Download /> Summary CSV</button>
                        <button className="v-btn v-btn-ghost" onClick={() => window.print()}><Printer /> Print / PDF</button>
                    </>
                }
            />

            <div className="v-filters">
                <div className="v-chips">
                    {RANGES.map((range) => (
                        <button
                            key={range.label}
                            className={`v-chip ${filters.date_to === today && filters.date_from === addDays(today, -(range.days - 1)) ? "active" : ""}`}
                            onClick={() => setFilters({ ...filters, date_from: addDays(today, -(range.days - 1)), date_to: today })}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
                <Field label="From"><input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} /></Field>
                <Field label="To"><input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} /></Field>
                <Field label="Staff">
                    <select value={filters.staff} onChange={(e) => setFilters({ ...filters, staff: e.target.value })}>
                        <option value="">Everyone</option>
                        {staff.map((m) => <option key={m.id} value={m.id}>{m.staff_name}</option>)}
                    </select>
                </Field>
                <Field label="Service">
                    <select value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })}>
                        <option value="">All services</option>
                        {services.map((s) => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                    </select>
                </Field>
            </div>

            <Alert>{error}</Alert>

            {!r ? (
                <Spinner label="Crunching the numbers..." />
            ) : (
                <>
                    <div className="v-kpis">
                        <Kpi label="Bookings" value={r.bookings.total} note={`${r.bookings.by_status.completed} completed`} />
                        <Kpi label="Revenue collected" value={formatMoney(r.revenue.collected)} note={`${formatMoney(r.revenue.booked_value)} booked`} />
                        <Kpi label="No-show rate" value={`${r.attendance.no_show_rate_pct}%`} note={`${r.attendance.late_cancellations} late cancellations`} />
                        <Kpi label="Staff occupancy" value={`${r.capacity.occupancy_pct}%`} note={`${r.capacity.idle_hours} idle hours`} />
                    </div>

                    <Section title="Bookings per day" badge={`${r.range.date_from} to ${r.range.date_to}`}>
                        <div className="v-columns">
                            {r.bookings.trend.map((d) => {
                                const max = Math.max(1, ...r.bookings.trend.map((x) => x.bookings));
                                return <div key={d.date} className="v-column" title={`${d.date}: ${d.bookings}`} style={{ height: `${Math.max((d.bookings / max) * 100, d.bookings ? 4 : 1)}%` }} />;
                            })}
                        </div>
                        <div className="v-axis"><span>{r.range.date_from}</span><span>{r.range.date_to}</span></div>
                    </Section>

                    <div className="v-two-col">
                        <Section title="Booking funnel" text={`${r.funnel.conversion_pct}% of visitors to your booking page booked`}>
                            <Bars rows={r.funnel.steps.map((s) => ({ label: s.label, value: s.sessions }))} />
                            {r.funnel.by_source.length > 0 && (
                                <>
                                    <h3 className="v-subheading">By source</h3>
                                    <Bars rows={r.funnel.by_source.map((s) => ({ label: s.source, value: s.conversion_pct }))} format={(v) => `${v}%`} />
                                </>
                            )}
                        </Section>
                        <Section title="Attendance & reliability">
                            <dl className="v-detail-grid">
                                <div><dt>Cancellation rate</dt><dd>{r.attendance.cancellation_rate_pct}%</dd></div>
                                <div><dt>Late cancellations</dt><dd>{r.attendance.late_cancellations}</dd></div>
                                <div><dt>Rescheduled</dt><dd>{r.attendance.rescheduled_bookings} ({r.attendance.reschedule_rate_pct}%)</dd></div>
                                <div><dt>No-shows</dt><dd>{r.bookings.by_status.no_show}</dd></div>
                                <div><dt>No-shows with reminder</dt><dd>{r.attendance.reminder_effectiveness.no_show_rate_with_reminder_pct}%</dd></div>
                                <div><dt>No-shows without reminder</dt><dd>{r.attendance.reminder_effectiveness.no_show_rate_without_reminder_pct}%</dd></div>
                            </dl>
                            <h3 className="v-subheading">Booked through</h3>
                            <Bars rows={Object.entries(r.bookings.by_channel).map(([k, v]) => ({ label: k.replace("_", " "), value: v }))} />
                        </Section>
                    </div>

                    <Section title="Capacity & utilisation" text={`${r.capacity.booked_hours} of ${r.capacity.available_hours} working hours booked`}>
                        <div className="v-table-wrap">
                            <table className="v-table">
                                <thead><tr><th>Staff</th><th className="v-num">Bookings</th><th className="v-num">Booked h</th><th className="v-num">Available h</th><th className="v-num">Idle h</th><th>Occupancy</th></tr></thead>
                                <tbody>
                                    {r.capacity.staff.map((s) => (
                                        <tr key={s.staff_id}>
                                            <td>{s.staff_name}</td>
                                            <td className="v-num">{s.bookings}</td>
                                            <td className="v-num">{s.booked_hours}</td>
                                            <td className="v-num">{s.available_hours}</td>
                                            <td className="v-num">{s.idle_hours}</td>
                                            <td style={{ minWidth: 140 }}>
                                                <div className="v-bar-track"><div className="v-bar-fill" style={{ width: `${Math.min(s.occupancy_pct, 100)}%` }} /></div>
                                                <small>{s.occupancy_pct}%</small>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="v-two-col" style={{ marginTop: 20 }}>
                            <div>
                                <h3 className="v-subheading">Peak hours</h3>
                                <Bars rows={r.capacity.peak_hours.map((h) => ({ label: `${String(h.hour).padStart(2, "0")}:00`, value: h.bookings }))} />
                            </div>
                            <div>
                                <h3 className="v-subheading">Busiest days</h3>
                                <Bars rows={r.capacity.busiest_days.map((d) => ({ label: d.day, value: d.bookings }))} />
                                {r.capacity.resources.length > 0 && (
                                    <>
                                        <h3 className="v-subheading">Rooms & equipment</h3>
                                        <Bars rows={r.capacity.resources.map((x) => ({ label: x.name, value: x.bookings }))} />
                                    </>
                                )}
                            </div>
                        </div>
                    </Section>

                    <div className="v-two-col">
                        <Section title="Revenue by service">
                            <Bars rows={r.revenue.by_service.map((x) => ({ label: x.name, value: Number(x.collected) }))} format={formatMoney} />
                            <h3 className="v-subheading">By staff</h3>
                            <Bars rows={r.revenue.by_staff.map((x) => ({ label: x.name, value: Number(x.collected) }))} format={formatMoney} />
                        </Section>
                        <Section title="Payments">
                            <dl className="v-detail-grid">
                                <div><dt>Collected</dt><dd>{formatMoney(r.revenue.collected)}</dd></div>
                                <div><dt>Completed value</dt><dd>{formatMoney(r.revenue.completed_value)}</dd></div>
                                <div><dt>Deposits</dt><dd>{formatMoney(r.revenue.deposits_collected)}</dd></div>
                                <div><dt>Refunds</dt><dd>{formatMoney(r.revenue.refunds)}</dd></div>
                                <div><dt>Fees charged</dt><dd>{formatMoney(r.revenue.cancellation_fees_charged)}</dd></div>
                                <div><dt>Fees collected</dt><dd>{formatMoney(r.revenue.cancellation_fees_collected)}</dd></div>
                            </dl>
                            <h3 className="v-subheading">By payment method</h3>
                            <Bars rows={r.revenue.by_payment_method.map((x) => ({ label: x.method, value: Number(x.amount) }))} format={formatMoney} />
                            {r.revenue.by_location.length > 1 && (
                                <>
                                    <h3 className="v-subheading">By location</h3>
                                    <Bars rows={r.revenue.by_location.map((x) => ({ label: x.name, value: Number(x.collected) }))} format={formatMoney} />
                                </>
                            )}
                        </Section>
                    </div>

                    <Section title="Customers & retention">
                        <div className="v-kpis" style={{ marginBottom: 12 }}>
                            <Kpi label="Customers" value={r.customers.unique} />
                            <Kpi label="New / returning" value={`${r.customers.new} / ${r.customers.returning}`} />
                            <Kpi label="Repeat rate" value={`${r.customers.repeat_rate_pct}%`} />
                            <Kpi label="Days between visits" value={r.customers.avg_days_between_visits ?? "—"} />
                        </div>
                        <h3 className="v-subheading">How customers first found you</h3>
                        <Bars rows={r.customers.top_channels.map((c) => ({ label: c.channel.replace("_", " "), value: c.customers }))} />
                    </Section>
                </>
            )}
        </div>
    );
}

export default AnalyticsPage;
