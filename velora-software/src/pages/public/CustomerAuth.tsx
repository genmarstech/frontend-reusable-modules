import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

import { loginCustomer, registerCustomer } from "../../lib/api/customers";
import { fieldErrorsFrom, handleApiError } from "../../lib/api/handleErrors";
import type { CustomerSession } from "../../types/customers";
import { Alert, Field } from "../../components/ui";

export type AuthMode = "join" | "signin";

/**
 * Sign up ("join") or sign in as a customer of one business, from its booking link.
 * Customers are identified by their phone number, so the same account works at
 * every Velora business (and, later, on WhatsApp and Telegram).
 */
export function CustomerAuthForm({
    businessSlug,
    businessName,
    initialMode = "join",
    onDone,
    onCancel,
}: {
    businessSlug: string;
    businessName: string;
    initialMode?: AuthMode;
    onDone: (session: CustomerSession) => void;
    onCancel?: () => void;
}) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [form, setForm] = useState({ full_name: "", phone_number: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setError("");
        const missing: Record<string, string> = {};
        if (mode === "join" && form.full_name.trim().length < 2) missing.full_name = "Please enter your name.";
        if (!form.phone_number.trim()) missing.phone_number = "Please enter your phone number.";
        if (mode === "join" && !form.email.trim()) missing.email = "Please enter your email so we can send your confirmations.";
        if (!form.password) missing.password = "Please enter a password.";
        else if (mode === "join" && form.password.length < 8) missing.password = "Use at least 8 characters.";
        if (Object.keys(missing).length) {
            setErrors(missing);
            return;
        }
        setBusy(true);
        try {
            const session =
                mode === "join"
                    ? await registerCustomer({
                          business: businessSlug,
                          full_name: form.full_name.trim(),
                          phone_number: form.phone_number.trim(),
                          email: form.email.trim(),
                          password: form.password,
                      })
                    : await loginCustomer({
                          business: businessSlug,
                          phone_number: form.phone_number.trim(),
                          password: form.password,
                      });
            onDone(session);
        } catch (err) {
            const fields = fieldErrorsFrom(err);
            setErrors(fields);
            const apiError = handleApiError(err);
            if (apiError.status === 429) {
                setError("Too many attempts. Please wait a little and try again.");
            } else if (!Object.keys(fields).some((k) => k in form) || mode === "signin") {
                setError(apiError.message);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <form className="bk-auth" onSubmit={submit} noValidate>
            <div className="bk-auth-tabs" role="tablist" aria-label="Account">
                <button type="button" role="tab" aria-selected={mode === "join"} className={mode === "join" ? "active" : ""} onClick={() => { setMode("join"); setError(""); setErrors({}); }}>
                    New here
                </button>
                <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); setErrors({}); }}>
                    I have an account
                </button>
            </div>
            <h2>{mode === "join" ? `Become a ${businessName} client` : "Welcome back"}</h2>
            <p className="bk-sub">
                {mode === "join"
                    ? "Save your details once. Next time, book or rebook your favourite service in a tap."
                    : "Sign in with your phone number to see your bookings and rebook in a tap."}
            </p>
            <Alert>{error}</Alert>
            <div className="v-form-grid">
                {mode === "join" && (
                    <Field label="Full name" error={errors.full_name}>
                        <input value={form.full_name} onChange={set("full_name")} autoComplete="name" required />
                    </Field>
                )}
                <Field label="Phone number" error={errors.phone_number} hint={mode === "join" ? "This is how you sign in." : undefined}>
                    <input type="tel" inputMode="tel" placeholder="07XX XXX XXX" autoComplete="tel" value={form.phone_number} onChange={set("phone_number")} required />
                </Field>
                {mode === "join" && (
                    <Field label="Email" error={errors.email} hint="For your confirmations and reminders.">
                        <input type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
                    </Field>
                )}
                <Field label="Password" error={errors.password} hint={mode === "join" ? "At least 8 characters." : undefined}>
                    <span className="bk-password">
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete={mode === "join" ? "new-password" : "current-password"}
                            value={form.password}
                            onChange={set("password")}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </span>
                </Field>
            </div>
            <div className="bk-actions">
                {onCancel ? (
                    <button type="button" className="bk-back" onClick={onCancel}>← Back</button>
                ) : (
                    <span />
                )}
                <button type="submit" className="v-btn" disabled={busy}>
                    {busy ? "Please wait..." : mode === "join" ? "Join and continue" : "Sign in"}
                </button>
            </div>
            {mode === "signin" && (
                <p className="v-hint bk-auth-help">
                    Forgot your password? You can still book as a guest, and {businessName} can help you with your booking.
                </p>
            )}
        </form>
    );
}
