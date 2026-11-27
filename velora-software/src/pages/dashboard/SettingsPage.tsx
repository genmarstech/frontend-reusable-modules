import { useState, type ChangeEvent, type FormEvent } from "react";

import { updateBusiness } from "../../lib/api/auth";
import { publicBookingUrl, updatePolicy } from "../../lib/api/bookings";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import { shortTime } from "../../lib/format";
import { CATEGORY_LABELS } from "../../types/business";
import type { BookingPolicy, NotifyChannel } from "../../types/bookings";
import { Alert, Field, PageHeader, Section } from "../../components/ui";
import { useDashboard } from "./dashboard-context";

const TIMEZONES = ["Africa/Nairobi", "Africa/Kampala", "Africa/Dar_es_Salaam", "Africa/Kigali", "Africa/Lagos", "Africa/Johannesburg", "Africa/Cairo", "Europe/London", "Europe/Paris", "Asia/Dubai", "America/New_York", "UTC"];

function SettingsPage() {
    return (
        <div className="dashboard-overview">
            <PageHeader title="Settings" text="Your business profile, booking rules and notification preferences." />
            <BookingLinkSection />
            <PolicySection />
            <ProfileSection />
        </div>
    );
}

function BookingLinkSection() {
    const { business } = useDashboard();
    const url = publicBookingUrl(business.id);
    const [copied, setCopied] = useState(false);
    return (
        <Section title="Your booking page" text="Share this link on WhatsApp, Instagram or your website. Add ?source=instagram to track where bookings come from.">
            <div className="v-copy-box">
                <input className="v-input" readOnly value={url} onFocus={(e) => e.target.select()} />
                <button
                    className="v-btn"
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(url);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        } catch {
                            /* the field is selectable as a fallback */
                        }
                    }}
                >
                    {copied ? "Copied" : "Copy"}
                </button>
                <a className="v-btn v-btn-ghost" href={url} target="_blank" rel="noreferrer">Open</a>
            </div>
        </Section>
    );
}

function PolicySection() {
    const { business, policy, setPolicy } = useDashboard();
    const [form, setForm] = useState<BookingPolicy>(policy);
    const [reminders, setReminders] = useState(policy.reminder_hours.join(", "));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const set = <K extends keyof BookingPolicy>(key: K, value: BookingPolicy[K]) => setForm((f) => ({ ...f, [key]: value }));
    const num = (key: keyof BookingPolicy) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

    const toggleChannel = (c: NotifyChannel) =>
        set("notification_channels", form.notification_channels.includes(c) ? form.notification_channels.filter((x) => x !== c) : [...form.notification_channels, c]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        setMessage("");
        const reminderHours = reminders.split(",").map((x) => Number(x.trim())).filter((x) => x > 0);
        try {
            const updated = await updatePolicy(business.id, {
                ...form,
                reminder_hours: reminderHours,
                quiet_hours_start: form.quiet_hours_start || null,
                quiet_hours_end: form.quiet_hours_end || null,
            });
            setPolicy(updated);
            setForm(updated);
            setMessage("Booking rules saved.");
        } catch (err) {
            setErrors(fieldErrorsFrom(err));
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Section title="Booking rules" text="These apply to your online booking page. You can override them from the dashboard, and overrides are logged.">
            <form onSubmit={submit}>
                <Alert>{error}</Alert>
                <Alert kind="success">{message}</Alert>

                <h3 className="v-subheading" style={{ marginTop: 0 }}>Scheduling</h3>
                <div className="v-form-grid v-form-grid-3">
                    <Field label="Time zone" error={errors.timezone}>
                        <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
                            {[...new Set([form.timezone, ...TIMEZONES])].map((tz) => <option key={tz}>{tz}</option>)}
                        </select>
                    </Field>
                    <Field label="Slot interval (minutes)" hint="How often start times are offered">
                        <input type="number" min="5" step="5" value={form.slot_interval_minutes} onChange={num("slot_interval_minutes")} />
                    </Field>
                    <Field label="Minimum notice (minutes)" hint="e.g. 60 = no bookings less than an hour ahead">
                        <input type="number" min="0" value={form.min_notice_minutes} onChange={num("min_notice_minutes")} />
                    </Field>
                    <Field label="Book up to (days ahead)">
                        <input type="number" min="1" value={form.max_advance_days} onChange={num("max_advance_days")} />
                    </Field>
                    <Field label="Late arrival grace (minutes)">
                        <input type="number" min="0" value={form.late_arrival_grace_minutes} onChange={num("late_arrival_grace_minutes")} />
                    </Field>
                    <Field label="Online bookings">
                        <label className="v-check" style={{ paddingTop: 10 }}>
                            <input type="checkbox" checked={form.auto_confirm} onChange={(e) => set("auto_confirm", e.target.checked)} />
                            Confirm automatically
                        </label>
                    </Field>
                </div>

                <h3 className="v-subheading">Cancellations & rescheduling</h3>
                <div className="v-form-grid v-form-grid-3">
                    <Field label="Cancel online up to (hours before)">
                        <input type="number" min="0" value={form.cancellation_window_hours} onChange={num("cancellation_window_hours")} />
                    </Field>
                    <Field label="Reschedule online up to (hours before)">
                        <input type="number" min="0" value={form.reschedule_window_hours} onChange={num("reschedule_window_hours")} />
                    </Field>
                    <Field label="Max reschedules per booking">
                        <input type="number" min="0" value={form.max_reschedules} onChange={num("max_reschedules")} />
                    </Field>
                    <Field label="Late cancellation & no-show fee (%)" error={errors.cancellation_fee_percentage}>
                        <input type="number" min="0" max="100" value={form.cancellation_fee_percentage} onChange={(e) => set("cancellation_fee_percentage", e.target.value)} />
                    </Field>
                </div>

                <h3 className="v-subheading">Deposits</h3>
                <div className="v-form-grid v-form-grid-3">
                    <Field label="Deposit">
                        <label className="v-check" style={{ paddingTop: 10 }}>
                            <input type="checkbox" checked={form.deposit_required} onChange={(e) => set("deposit_required", e.target.checked)} />
                            Require a deposit for online bookings
                        </label>
                    </Field>
                    <Field label="Deposit (% of price)" error={errors.deposit_percentage} hint="Services can set a fixed amount instead">
                        <input type="number" min="0" max="100" disabled={!form.deposit_required} value={form.deposit_percentage} onChange={(e) => set("deposit_percentage", e.target.value)} />
                    </Field>
                    <Field label="Hold the slot for (minutes)" hint="Unpaid bookings are released after this">
                        <input type="number" min="5" disabled={!form.deposit_required} value={form.hold_minutes} onChange={num("hold_minutes")} />
                    </Field>
                    <Field label="Refunds">
                        <label className="v-check" style={{ paddingTop: 10 }}>
                            <input type="checkbox" checked={form.refund_deposit_on_cancellation} onChange={(e) => set("refund_deposit_on_cancellation", e.target.checked)} />
                            Refund deposits on on-time cancellations
                        </label>
                    </Field>
                    <Field label="Policy shown to customers" full>
                        <textarea value={form.policy_notes} onChange={(e) => set("policy_notes", e.target.value)} placeholder="e.g. Please arrive 5 minutes early. Deposits are non-refundable within 24 hours." />
                    </Field>
                </div>

                <h3 className="v-subheading">Notifications</h3>
                <div className="v-chips" style={{ marginBottom: 16 }}>
                    {(["email", "sms", "whatsapp", "push"] as const).map((c) => (
                        <button type="button" key={c} className={`v-chip ${form.notification_channels.includes(c) ? "active" : ""}`} onClick={() => toggleChannel(c)}>
                            {{ email: "Email", sms: "SMS", whatsapp: "WhatsApp", push: "Push" }[c]}
                        </button>
                    ))}
                </div>
                <div className="v-form-grid v-form-grid-3">
                    <Field label="Reminders (hours before)" hint="Comma separated, e.g. 24, 2" error={errors.reminder_hours}>
                        <input value={reminders} onChange={(e) => setReminders(e.target.value)} />
                    </Field>
                    <Field label="Follow-up after visit (hours)">
                        <input type="number" min="0" value={form.follow_up_hours} onChange={num("follow_up_hours")} />
                    </Field>
                    <Field label="Team alerts">
                        <label className="v-check" style={{ paddingTop: 10 }}>
                            <input type="checkbox" checked={form.notify_staff} onChange={(e) => set("notify_staff", e.target.checked)} />
                            Email staff about new and changed bookings
                        </label>
                    </Field>
                    <Field label="Quiet hours start" hint="Follow-ups wait until quiet hours end">
                        <input type="time" value={shortTime(form.quiet_hours_start)} onChange={(e) => set("quiet_hours_start", e.target.value || null)} />
                    </Field>
                    <Field label="Quiet hours end">
                        <input type="time" value={shortTime(form.quiet_hours_end)} onChange={(e) => set("quiet_hours_end", e.target.value || null)} />
                    </Field>
                </div>

                <div className="v-form-actions">
                    <button className="v-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save booking rules"}</button>
                </div>
            </form>
        </Section>
    );
}

function ProfileSection() {
    const { business, setBusiness } = useDashboard();
    const [form, setForm] = useState({
        business_name: business.business_name,
        business_description: business.business_description,
        business_category: business.business_category,
        whatsapp_number: business.whatsapp_number,
        business_email: business.business_email,
        number_of_service_users: String(business.number_of_service_users ?? 1),
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        setMessage("");
        const payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, v));
        if (logo) payload.append("business_logo", logo);
        try {
            const updated = await updateBusiness(business.id, payload);
            setBusiness(updated);
            setMessage("Profile saved.");
        } catch (err) {
            setErrors(fieldErrorsFrom(err));
            setError(handleApiError(err).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Section title="Business profile" text="What customers see on your booking page.">
            <form onSubmit={submit}>
                <Alert>{error}</Alert>
                <Alert kind="success">{message}</Alert>
                <div className="v-form-grid">
                    <Field label="Business name" error={errors.business_name}>
                        <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required />
                    </Field>
                    <Field label="Category" error={errors.business_category}>
                        <select value={form.business_category} onChange={(e) => setForm({ ...form, business_category: e.target.value })}>
                            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </Field>
                    <Field label="WhatsApp number" error={errors.whatsapp_number}>
                        <input type="tel" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} required />
                    </Field>
                    <Field label="Business email" error={errors.business_email}>
                        <input type="email" value={form.business_email} onChange={(e) => setForm({ ...form, business_email: e.target.value })} required />
                    </Field>
                    <Field label="People providing services" error={errors.number_of_service_users}>
                        <input type="number" min="1" value={form.number_of_service_users} onChange={(e) => setForm({ ...form, number_of_service_users: e.target.value })} />
                    </Field>
                    <Field label="Logo" error={errors.business_logo}>
                        <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
                    </Field>
                    <Field label="Description" full error={errors.business_description}>
                        <textarea value={form.business_description} onChange={(e) => setForm({ ...form, business_description: e.target.value })} required />
                    </Field>
                </div>
                <div className="v-form-actions">
                    <button className="v-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
                </div>
            </form>
        </Section>
    );
}

export default SettingsPage;
