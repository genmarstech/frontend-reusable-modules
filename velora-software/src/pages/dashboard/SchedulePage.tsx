import { useEffect, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";

import {
    createLocation,
    createResource,
    createTimeOff,
    deleteLocation,
    deleteResource,
    deleteTimeOff,
    getLocations,
    getResources,
    getTimeOff,
    getWaitlist,
    updateWaitlistEntry,
} from "../../lib/api/bookings";
import { handleApiError } from "../../lib/api/handleErrors";
import { formatDateTime, formatDayLabel, todayIn, zonedToIso } from "../../lib/format";
import type { Location, Resource, TimeOff, WaitlistEntry } from "../../types/bookings";
import { Alert, Field, PageHeader, Section, StatusBadge } from "../../components/ui";
import HoursEditor from "./HoursEditor";
import { useDashboard } from "./dashboard-context";

function SchedulePage() {
    return (
        <div className="dashboard-overview">
            <PageHeader title="Schedule" text="Opening hours, time off, rooms and the waitlist." />
            <Section title="Opening hours" text="The default hours for everyone. Team members can have their own hours on the Team page.">
                <HoursEditor staffId={null} />
            </Section>
            <TimeOffSection />
            <WaitlistSection />
            <div className="v-two-col">
                <ResourcesSection />
                <LocationsSection />
            </div>
        </div>
    );
}

function TimeOffSection() {
    const { business, staff, timeZone } = useDashboard();
    const today = todayIn(timeZone);
    const [items, setItems] = useState<TimeOff[]>([]);
    const [form, setForm] = useState({ staff: "", date: today, start: "09:00", endDate: today, end: "18:00", reason: "" });
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        getTimeOff(business.id).then(setItems).catch((err) => setError(handleApiError(err).message));
    }, [business.id, reload]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await createTimeOff({
                business: business.id,
                staff: form.staff ? Number(form.staff) : null,
                start: zonedToIso(form.date, form.start, timeZone),
                end: zonedToIso(form.endDate, form.end, timeZone),
                reason: form.reason,
            });
            setForm({ ...form, reason: "" });
            setReload((n) => n + 1);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <Section title="Time off & closures" text="Blocked time is removed from open slots. Existing bookings are not moved automatically.">
            <Alert>{error}</Alert>
            <form onSubmit={submit} className="v-form-grid v-form-grid-3">
                <Field label="Who">
                    <select value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })}>
                        <option value="">Whole business (closed)</option>
                        {staff.map((m) => (
                            <option key={m.id} value={m.id}>{m.staff_name}</option>
                        ))}
                    </select>
                </Field>
                <Field label="From">
                    <div style={{ display: "flex", gap: 6 }}>
                        <input type="date" className="v-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, endDate: e.target.value > form.endDate ? e.target.value : form.endDate })} />
                        <input type="time" className="v-input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                    </div>
                </Field>
                <Field label="Until">
                    <div style={{ display: "flex", gap: 6 }}>
                        <input type="date" className="v-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                        <input type="time" className="v-input" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
                    </div>
                </Field>
                <Field label="Reason" full>
                    <input placeholder="Public holiday, training, leave..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                </Field>
                <div className="v-field-full" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="v-btn" type="submit">Block time</button>
                </div>
            </form>
            {items.length > 0 && (
                <div className="v-table-wrap" style={{ marginTop: 18 }}>
                    <table className="v-table">
                        <thead>
                            <tr><th>Who</th><th>From</th><th>Until</th><th>Reason</th><th /></tr>
                        </thead>
                        <tbody>
                            {items.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.staff_name || "Whole business"}</td>
                                    <td>{formatDateTime(t.start, timeZone)}</td>
                                    <td>{formatDateTime(t.end, timeZone)}</td>
                                    <td>{t.reason || "—"}</td>
                                    <td className="v-num">
                                        <button className="v-icon-button" aria-label="Remove" onClick={async () => { await deleteTimeOff(t.id); setReload((n) => n + 1); }}>
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

function WaitlistSection() {
    const { business } = useDashboard();
    const [items, setItems] = useState<WaitlistEntry[]>([]);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        getWaitlist(business.id).then(setItems).catch(() => setItems([]));
    }, [business.id, reload]);

    const open = items.filter((i) => i.status === "waiting" || i.status === "notified");

    return (
        <Section title="Waitlist" text="Customers who asked to hear about openings. They are messaged automatically when a matching booking is cancelled." badge={`${open.length} waiting`}>
            {open.length === 0 ? (
                <p className="v-muted">Nobody is on the waitlist.</p>
            ) : (
                <div className="v-table-wrap">
                    <table className="v-table">
                        <thead><tr><th>Customer</th><th>Service</th><th>Wanted date</th><th>Status</th><th /></tr></thead>
                        <tbody>
                            {open.map((w) => (
                                <tr key={w.id}>
                                    <td>{w.customer_name}</td>
                                    <td>{w.service_name}</td>
                                    <td>{formatDayLabel(w.desired_date)}</td>
                                    <td><StatusBadge status={w.status} /></td>
                                    <td className="v-num">
                                        <button className="v-link" onClick={async () => { await updateWaitlistEntry(w.id, "booked"); setReload((n) => n + 1); }}>Mark booked</button>
                                        {"  ·  "}
                                        <button className="v-link" onClick={async () => { await updateWaitlistEntry(w.id, "removed"); setReload((n) => n + 1); }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

function ResourcesSection() {
    const { business } = useDashboard();
    const [items, setItems] = useState<Resource[]>([]);
    const [form, setForm] = useState({ name: "", kind: "room", capacity: "1" });
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        getResources(business.id).then(setItems).catch(() => setItems([]));
    }, [business.id, reload]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await createResource({ business: business.id, name: form.name, kind: form.kind as Resource["kind"], capacity: Number(form.capacity) || 1 });
            setForm({ name: "", kind: "room", capacity: "1" });
            setReload((n) => n + 1);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <Section title="Rooms & equipment" text="Link a service to a room or machine so it is never double-booked.">
            <Alert>{error}</Alert>
            <form onSubmit={submit} className="v-form-grid v-form-grid-3">
                <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
                <Field label="Type">
                    <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                        <option value="room">Room</option>
                        <option value="equipment">Equipment</option>
                    </select>
                </Field>
                <Field label="At once"><input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
                <div className="v-field-full" style={{ display: "flex", justifyContent: "flex-end" }}><button className="v-btn v-btn-small" type="submit">Add</button></div>
            </form>
            {items.map((r) => (
                <div className="v-hours-row" style={{ gridTemplateColumns: "1fr auto auto" }} key={r.id}>
                    <strong>{r.name}</strong>
                    <span className="v-muted">{r.kind === "room" ? "Room" : "Equipment"} · fits {r.capacity}</span>
                    <button className="v-icon-button" aria-label="Remove" onClick={async () => { await deleteResource(r.id); setReload((n) => n + 1); }}><Trash2 size={15} /></button>
                </div>
            ))}
        </Section>
    );
}

function LocationsSection() {
    const { business } = useDashboard();
    const [items, setItems] = useState<Location[]>([]);
    const [form, setForm] = useState({ name: "", address: "", is_virtual: false, meeting_link: "" });
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        getLocations(business.id).then(setItems).catch(() => setItems([]));
    }, [business.id, reload]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await createLocation({ business: business.id, ...form });
            setForm({ name: "", address: "", is_virtual: false, meeting_link: "" });
            setReload((n) => n + 1);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <Section title="Locations" text="Branches, or a virtual location for online consultations.">
            <Alert>{error}</Alert>
            <form onSubmit={submit} className="v-form-grid">
                <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
                <Field label={form.is_virtual ? "Meeting link" : "Address"}>
                    {form.is_virtual ? (
                        <input type="url" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
                    ) : (
                        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    )}
                </Field>
                <label className="v-check"><input type="checkbox" checked={form.is_virtual} onChange={(e) => setForm({ ...form, is_virtual: e.target.checked })} /> Virtual</label>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="v-btn v-btn-small" type="submit">Add</button></div>
            </form>
            {items.map((l) => (
                <div className="v-hours-row" style={{ gridTemplateColumns: "1fr auto auto" }} key={l.id}>
                    <strong>{l.name}</strong>
                    <span className="v-muted">{l.is_virtual ? "Virtual" : l.address || "—"}</span>
                    <button className="v-icon-button" aria-label="Remove" onClick={async () => { await deleteLocation(l.id); setReload((n) => n + 1); }}><Trash2 size={15} /></button>
                </div>
            ))}
        </Section>
    );
}

export default SchedulePage;
