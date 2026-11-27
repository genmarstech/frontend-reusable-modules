import { useState, type FormEvent } from "react";
import { Plus, Users } from "lucide-react";

import { createStaff, deleteStaff, updateStaff } from "../../lib/api/auth";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import type { Staff } from "../../types/staff";
import { Alert, EmptyState, Field, Modal, PageHeader, Section } from "../../components/ui";
import HoursEditor from "./HoursEditor";
import { useDashboard } from "./dashboard-context";

function TeamPage() {
    const { staff, services } = useDashboard();
    const [editing, setEditing] = useState<Staff | "new" | null>(null);
    const { reloadStaff } = useDashboard();

    return (
        <div className="dashboard-overview">
            <PageHeader
                title="Team"
                text="Who provides which services, and when they work."
                actions={
                    <button className="v-btn" onClick={() => setEditing("new")}>
                        <Plus /> Add team member
                    </button>
                }
            />
            <Section title="Your team" badge={`${staff.length} ${staff.length === 1 ? "member" : "members"}`}>
                {staff.length === 0 ? (
                    <EmptyState
                        icon={<Users size={30} />}
                        title="No team members yet"
                        text="Customers can only book once at least one team member is added. Add yourself if you work alone."
                    />
                ) : (
                    <div className="staff-list">
                        {staff.map((member) => (
                            <button
                                type="button"
                                className="staff-card"
                                key={member.id}
                                onClick={() => setEditing(member)}
                                style={{ font: "inherit", textAlign: "left", cursor: "pointer", width: "100%" }}
                            >
                                <div className="staff-avatar">{member.staff_name.charAt(0).toUpperCase()}</div>
                                <div className="staff-details">
                                    <h3>{member.staff_name}</h3>
                                    <p>
                                        {member.staff_email}
                                        {" · "}
                                        {member.skills?.length
                                            ? services.filter((s) => member.skills.includes(s.id)).map((s) => s.service_name).join(", ")
                                            : "All services"}
                                    </p>
                                </div>
                                <span className={member.is_available ? "staff-status available" : "staff-status unavailable"}>
                                    {member.is_available ? "Available" : "Unavailable"}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </Section>
            {editing && (
                <StaffModal
                    member={editing === "new" ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={async (close) => {
                        await reloadStaff();
                        if (close) setEditing(null);
                    }}
                />
            )}
        </div>
    );
}

function StaffModal({
    member,
    onClose,
    onSaved,
}: {
    member: Staff | null;
    onClose: () => void;
    onSaved: (close: boolean) => Promise<void>;
}) {
    const { business, services } = useDashboard();
    const [form, setForm] = useState({
        staff_name: member?.staff_name || "",
        staff_email: member?.staff_email || "",
        staff_phone: member?.staff_phone || "",
        id_number: member?.id_number || "",
        is_available: member?.is_available ?? true,
        skills: member?.skills || [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const toggleSkill = (id: number) =>
        setForm((f) => ({ ...f, skills: f.skills.includes(id) ? f.skills.filter((s) => s !== id) : [...f.skills, id] }));

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        setMessage("");
        try {
            if (member) {
                await updateStaff(member.id, form);
                setMessage("Saved.");
                await onSaved(false);
            } else {
                await createStaff(business.id, form);
                await onSaved(true);
            }
        } catch (err) {
            setErrors(fieldErrorsFrom(err));
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!member || !window.confirm(`Remove ${member.staff_name} from the team? Their past bookings stay.`)) return;
        try {
            await deleteStaff(member.id);
            await onSaved(true);
        } catch (err) {
            setError(handleApiError(err).message);
        }
    };

    return (
        <Modal title={member ? member.staff_name : "Add team member"} onClose={onClose} wide>
            <form onSubmit={submit}>
                <Alert>{error}</Alert>
                <Alert kind="success">{message}</Alert>
                <div className="v-form-grid">
                    <Field label="Full name" error={errors.staff_name}>
                        <input value={form.staff_name} onChange={(e) => setForm({ ...form, staff_name: e.target.value })} required />
                    </Field>
                    <Field label="Email" hint="New-booking alerts go here" error={errors.staff_email}>
                        <input type="email" value={form.staff_email} onChange={(e) => setForm({ ...form, staff_email: e.target.value })} required />
                    </Field>
                    <Field label="Phone" error={errors.staff_phone}>
                        <input type="tel" value={form.staff_phone} onChange={(e) => setForm({ ...form, staff_phone: e.target.value })} />
                    </Field>
                    <Field label="ID number" error={errors.id_number}>
                        <input maxLength={8} value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} required />
                    </Field>
                </div>
                <h3 className="v-subheading">Services they perform</h3>
                <p className="v-hint" style={{ marginTop: -6, marginBottom: 10 }}>Leave all unselected if they can do every service.</p>
                <div className="v-chips">
                    {services.map((s) => (
                        <button type="button" key={s.id} className={`v-chip ${form.skills.includes(s.id) ? "active" : ""}`} onClick={() => toggleSkill(s.id)}>
                            {s.service_name}
                        </button>
                    ))}
                </div>
                {errors.skills && <small className="field-error">{errors.skills}</small>}
                <label className="v-check" style={{ marginTop: 16 }}>
                    <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
                    Available for bookings
                </label>
                <div className="v-form-actions">
                    {member && (
                        <button type="button" className="v-btn v-btn-danger" style={{ marginRight: "auto" }} onClick={remove}>
                            Remove
                        </button>
                    )}
                    <button type="button" className="v-btn v-btn-ghost" onClick={onClose}>Close</button>
                    <button type="submit" className="v-btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                </div>
            </form>
            {member && (
                <>
                    <h3 className="v-subheading">Working hours</h3>
                    <HoursEditor staffId={member.id} />
                </>
            )}
        </Modal>
    );
}

export default TeamPage;
