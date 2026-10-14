"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({ email: z.string().email("Enter a valid email address.") });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Deliberately doesn't branch on the response — the backend answers
    // identically whether or not the address has an account (no
    // enumeration oracle), so the frontend shouldn't undo that by reacting
    // differently to success vs. "unknown email".
    await fetch("/api/proxy/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text">
          If that email address has an account, a reset code has been sent to it. Enter it on the next
          screen along with a new password.
        </p>
        <Button onClick={() => router.push(`/reset-password?email=${encodeURIComponent(getValues("email"))}`)}>
          I have a code
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Button type="submit" loading={isSubmitting} className="mt-2">
        Send reset code
      </Button>
    </form>
  );
}
