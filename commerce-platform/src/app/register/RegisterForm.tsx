"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect";

type FieldErrors = Record<string, string[]>;

function isFieldErrors(body: unknown): body is FieldErrors {
  return (
    !!body &&
    typeof body === "object" &&
    !("detail" in body) &&
    Object.values(body as Record<string, unknown>).every((v) => Array.isArray(v))
  );
}

/**
 * Mirrors LoginForm's own structure deliberately — same validation/error
 * presentation pattern, same two possible error-body shapes from the
 * backend (core/exceptions.py + DRF's own handler never produce a third).
 * The one difference: a successful register signs the caller straight in
 * (see the BFF route), so this redirects exactly like a successful login.
 */
export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = ["Email is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ["Enter a valid email address."];
    }
    if (!password) {
      errors.password = ["Password is required."];
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          phone_number: phoneNumber || undefined,
        }),
      });

      if (response.ok) {
        router.push(sanitizeNextPath(nextPath));
        router.refresh();
        return;
      }

      const body = await response.json().catch(() => null);
      if (isFieldErrors(body)) {
        setFieldErrors(body);
      } else {
        const detail = body && typeof body === "object" && "detail" in body ? String(body.detail) : null;
        setFormError(detail ?? "Could not create your account. Try again.");
      }
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-neutral-700">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={submitting}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-50"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-neutral-700">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={submitting}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.email)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-50"
        />
        {fieldErrors.email?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id="phone_number"
          name="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder="07XXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={submitting}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-50"
        />
        {fieldErrors.phone_number?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.password)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-50"
        />
        {fieldErrors.password?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-600">
            {message}
          </p>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
