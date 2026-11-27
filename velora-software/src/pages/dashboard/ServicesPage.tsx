import { useEffect, useState, type FormEvent } from "react";
import { Plus, Scissors } from "lucide-react";

import { createService, deleteService, updateService } from "../../lib/api/auth";
import { getResources } from "../../lib/api/bookings";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import { formatMoney } from "../../lib/format";
import type { Resource } from "../../types/bookings";
import type { Service } from "../../types/services";
import { Alert, EmptyState, Field, Modal, PageHeader, Section } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

function ServicesPage() {
    const { business, services, reloadServices, policy } = useDashboard();
    const [editing, setEditing] = useState<Service | "new" | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getResources(business.id).then(setResources).catch(() => setResources([]));
    }, [business.id]);

    const toggle = async (service: Service) => {
        try {
            await updateService(service.id, { is_available: !service.is_available });
            await reloadServices();
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Services"
                text="What customers can book, how long it takes and what it costs."
                actions={
                    <button className="v-btn" onClick={() => setEditing("new")}>
                        <Plus /> Add service
                    </button>
                }
            />
            <Alert>{error}</Alert>
            <Section title="Service menu" badge={`${services.length} ${services.length === 1 ? "service" : "services"}`}>
                {services.length === 0 ? (
                    <EmptyState icon={<Scissors size={30} />} title="No services yet" text="Add your first service to open bookings." />
                ) : (
                    <div className="v-table-wrap">
                        <table className="v-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th className="v-num">Duration</th>
                                    <th className="v-num">Buffers</th>
                                    <th className="v-num">Price</th>
                                    <th className="v-num">Deposit</th>
                                    <th>Bookable</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <strong>{s.service_name}</strong>
                                            {s.service_description && <small>{s.service_description}</small>}
                                        </td>
                                        <td className="v-num">{s.duration_minutes} min</td>
                                        <td className="v-num">
                                            {s.buffer_before_minutes || s.buffer_after_minutes
                                                ? `${s.buffer_before_minutes} / ${s.buffer_after_minutes} min`
                                                : "—"}
                                        </td>
                                        <td className="v-num">{formatMoney(s.price)}</td>
                                        <td className="v-num">
                                            {!policy.deposit_required
                                                ? "—"
                                                : s.deposit_amount !== null
                                                  ? formatMoney(s.deposit_amount)
                                                  : `${Number(policy.deposit_percentage)}%`}
                                        </td>
                                        <td>
                                            <label className="v-check">
                                                <input type="checkbox" checked={s.is_available} onChange={() => toggle(s)} />
                                                {s.is_available ? "Yes" : "Hidden"}
                                            </label>
                                        </td>
                                        <td className="v-num">
                                            <button className="v-link" onClick={() => setEditing(s)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
            {editing && (
                <ServiceModal
                    service={editing === "new" ? null : editing}
                    resources={resources}
                    onClose={() => setEditing(null)}
                    onSaved={async () => {
                        setEditing(null);
                        await reloadServices();
                    }}
                />
            )}
        </div>
    );
}

function ServiceModal({
    service,
    resources,
    onClose,
    onSaved,
}: {
    service: Service | null;
    resources: Resource[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const { business } = useDashboard();
    const [form, setForm] = useState({
        service_name: service?.service_name || "",
        service_description: service?.service_description || "",
        price: service?.price || "",
        duration_minutes: String(service?.duration_minutes || 60),
        buffer_before_minutes: String(service?.buffer_before_minutes || 0),
        buffer_after_minutes: String(service?.buffer_after_minutes || 0),
        deposit_amount: service?.deposit_amount || "",
        resource: service?.resource ? String(service.resource) : "",
        is_available: service?.is_available ?? true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        const payload = {
            business: business.id,
            service_name: form.service_name.trim(),
            service_description: form.service_description.trim(),
            price: String(form.price),
            duration_minutes: Number(form.duration_minutes),
            buffer_before_minutes: Number(form.buffer_before_minutes) || 0,
            buffer_after_minutes: Number(form.buffer_after_minutes) || 0,
            deposit_amount: form.deposit_amount === "" ? null : String(form.deposit_amount),
            resource: form.resource ? Number(form.resource) : null,
            is_available: form.is_available,
        };
        try {
            if (service) await updateService(service.id, payload);
            else await createService(payload);
            onSaved();
        } catch (err) {
            setErrors(fieldErrorsFrom(err));
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!service || !window.confirm(`Delete ${service.service_name}? Services with bookings cannot be deleted; hide them instead.`)) return;
        try {
            await deleteService(service.id);
            onSaved();
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <Modal title={service ? "Edit service" : "Add service"} onClose={onClose} wide>
            <form onSubmit={submit}>
                <Alert>{error}</Alert>
                <div className="v-form-grid">
                    <Field label="Service name" error={errors.service_name}>
                        <input value={form.service_name} onChange={(e) => set("service_name", e.target.value)} required />
                    </Field>
                    <Field label="Price" error={errors.price}>
                        <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required />
                    </Field>
                    <Field label="Duration (minutes)" error={errors.duration_minutes}>
                        <input type="number" min="5" step="5" value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} required />
                    </Field>
                    <Field label="Room or equipment" hint="Limits how many of these can run at once" error={errors.resource}>
                        <select value={form.resource} onChange={(e) => set("resource", e.target.value)}>
                            <option value="">None needed</option>
                            {resources.map((r) => (
                                <option key={r.id} value={r.id}>{r.name} (fits {r.capacity})</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Prep time before (minutes)" error={errors.buffer_before_minutes}>
                        <input type="number" min="0" step="5" value={form.buffer_before_minutes} onChange={(e) => set("buffer_before_minutes", e.target.value)} />
                    </Field>
                    <Field label="Cleanup time after (minutes)" error={errors.buffer_after_minutes}>
                        <input type="number" min="0" step="5" value={form.buffer_after_minutes} onChange={(e) => set("buffer_after_minutes", e.target.value)} />
                    </Field>
                    <Field label="Fixed deposit" hint="Leave empty to use the deposit % from Settings" error={errors.deposit_amount}>
                        <input type="number" min="0" step="0.01" value={form.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} />
                    </Field>
                    <Field label="Visibility">
                        <label className="v-check" style={{ paddingTop: 10 }}>
                            <input type="checkbox" checked={form.is_available} onChange={(e) => set("is_available", e.target.checked)} />
                            Customers can book this service
                        </label>
                    </Field>
                    <Field label="Description" full error={errors.service_description}>
                        <textarea value={form.service_description} onChange={(e) => set("service_description", e.target.value)} />
                    </Field>
                </div>
                <div className="v-form-actions">
                    {service && (
                        <button type="button" className="v-btn v-btn-danger" style={{ marginRight: "auto" }} onClick={remove}>
                            Delete
                        </button>
                    )}
                    <button type="button" className="v-btn v-btn-ghost" onClick={onClose}>Cancel</button>
                    <button type="submit" className="v-btn" disabled={saving}>{saving ? "Saving..." : "Save service"}</button>
                </div>
            </form>
        </Modal>
    );
}

export default ServicesPage;
