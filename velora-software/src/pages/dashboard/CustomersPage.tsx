import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { createCustomer, getCustomerBookings, getCustomers, updateCustomer } from "../../lib/api/bookings";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import { formatDate } from "../../lib/format";
import type { Booking, Customer } from "../../types/bookings";
import { Alert, EmptyState, Field, Modal, PageHeader, Section, Spinner } from "../../components/ui";
import { BookingRow } from "./BookingsPage";
import { BookingDetailModal } from "./BookingModals";
import { useDashboard } from "./dashboard-context";
import { ClientsArt } from "../../components/Illustrations";

const EMPTY = {
    full_name: "",
    email: "",
    phone_number: "",
    notes: "",
    preferred_channel: "",
    opt_out_email: false,
    opt_out_sms: false,
    opt_out_whatsapp: false,
    opt_out_push: false,
};

function CustomersPage() {
    const { business, timeZone } = useDashboard();
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[] | null>(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<Customer | "new" | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;
        const timer = setTimeout(() => {
            getCustomers(business.id, search.trim())
                .then((rows) => active && setCustomers(rows))
                .catch((err) => active && setError(handleApiError(err).message));
        }, 200);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [business.id, search, reload]);

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Customers"
                text="Everyone who has booked with you, with their history and contact preferences."
                actions={
                    <button className="v-btn" onClick={() => setEditing("new")}>
                        <Plus /> Add customer
                    </button>
                }
            />
            <div className="v-filters">
                <Field label="Search">
                    <input placeholder="Name, phone or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                </Field>
            </div>
            <Alert>{error}</Alert>
            <Section title="Customer list" badge={customers ? `${customers.length} ${customers.length === 1 ? "customer" : "customers"}` : undefined}>
                {customers === null ? (
                    <Spinner />
                ) : customers.length === 0 ? (
                    <EmptyState art={<ClientsArt />} title="No customers yet" text="Customers appear here once they book." />
                ) : (
                    <div className="v-table-wrap">
                        <table className="v-table v-table-stack">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th className="v-num">Bookings</th>
                                    <th className="v-num">No-shows</th>
                                    <th>Last visit</th>
                                    <th>First booked via</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={c.id} className="v-clickable" onClick={() => setEditing(c)}>
                                        <td data-label="Name">
                                            <strong>{c.full_name}</strong>
                                            {c.has_account && <span className="v-status v-status-confirmed cust-joined" title="Signed up on your booking link">Joined</span>}
                                        </td>
                                        <td data-label="Contact">
                                            {c.phone_number}
                                            <small>{c.email}</small>
                                        </td>
                                        <td data-label="Bookings" className="v-num">{c.total_bookings}</td>
                                        <td data-label="No-shows" className="v-num">{c.no_shows}</td>
                                        <td data-label="Last visit">{c.last_visit ? formatDate(c.last_visit, timeZone) : "—"}</td>
                                        <td data-label="First booked via">{c.first_channel || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>

            {editing && (
                <CustomerModal
                    customer={editing === "new" ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        setReload((n) => n + 1);
                    }}
                />
            )}
        </div>
    );
}

function CustomerModal({
    customer,
    onClose,
    onSaved,
}: {
    customer: Customer | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const { business, timeZone } = useDashboard();
    const [form, setForm] = useState(() => (customer ? { ...EMPTY, ...customer } : EMPTY));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState<Booking[] | null>(null);
    const [openId, setOpenId] = useState<number | null>(null);

    useEffect(() => {
        if (!customer) return;
        let active = true;
        getCustomerBookings(customer.id).then((rows) => active && setHistory(rows)).catch(() => active && setHistory([]));
        return () => {
            active = false;
        };
    }, [customer]);

    const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        const payload = {
            business: business.id,
            full_name: form.full_name,
            email: form.email,
            phone_number: form.phone_number,
            notes: form.notes,
            preferred_channel: form.preferred_channel as Customer["preferred_channel"],
            opt_out_email: form.opt_out_email,
            opt_out_sms: form.opt_out_sms,
            opt_out_whatsapp: form.opt_out_whatsapp,
            opt_out_push: form.opt_out_push,
        };
        try {
            if (customer) await updateCustomer(customer.id, payload);
            else await createCustomer(payload);
            onSaved();
        } catch (err) {
            setErrors(fieldErrorsFrom(err));
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title={customer ? customer.full_name : "Add customer"} onClose={onClose} wide>
            <form onSubmit={submit}>
                <Alert>{error}</Alert>
                <div className="v-form-grid">
                    <Field label="Full name" error={errors.full_name}>
                        <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
                    </Field>
                    <Field label="Phone" error={errors.phone_number}>
                        <input type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                    <Field label="Preferred channel">
                        <select value={form.preferred_channel} onChange={(e) => set("preferred_channel", e.target.value)}>
                            <option value="">Business default</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </Field>
                    <Field label="Notes" full>
                        <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                    </Field>
                </div>
                <h3 className="v-subheading">Messages they have opted out of</h3>
                <div className="v-chips">
                    {(["email", "sms", "whatsapp", "push"] as const).map((c) => (
                        <label className="v-check" key={c} style={{ marginRight: 14 }}>
                            <input
                                type="checkbox"
                                checked={Boolean(form[`opt_out_${c}`])}
                                onChange={(e) => set(`opt_out_${c}`, e.target.checked)}
                            />
                            {{ email: "Email", sms: "SMS", whatsapp: "WhatsApp", push: "Push" }[c]}
                        </label>
                    ))}
                </div>
                <div className="v-form-actions">
                    <button type="button" className="v-btn v-btn-ghost" onClick={onClose}>Close</button>
                    <button type="submit" className="v-btn" disabled={saving}>{saving ? "Saving..." : "Save customer"}</button>
                </div>
            </form>

            {customer && (
                <>
                    <h3 className="v-subheading">Booking history</h3>
                    {history === null ? (
                        <Spinner />
                    ) : history.length === 0 ? (
                        <p className="v-muted">No bookings yet.</p>
                    ) : (
                        history.map((b) => (
                            <div key={b.id}>
                                <small className="v-muted">{formatDate(b.start, timeZone)}</small>
                                <BookingRow booking={b} timeZone={timeZone} onOpen={() => setOpenId(b.id)} />
                            </div>
                        ))
                    )}
                </>
            )}
            {openId !== null && (
                <BookingDetailModal bookingId={openId} onClose={() => setOpenId(null)} onChanged={() => undefined} />
            )}
        </Modal>
    );
}

export default CustomersPage;
