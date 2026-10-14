"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { readableErrorMessage } from "@/lib/errors";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  code: z.string().length(6, "The code is 6 digits."),
  new_password: z.string().min(8, "At least 8 characters."),
});
type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm({ defaultEmail }: { defaultEmail: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: defaultEmail } });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const response = await fetch("/api/proxy/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setServerError(readableErrorMessage(data, "That code is invalid or has expired."));
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input id="email" label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input id="code" label="6-digit code" inputMode="numeric" error={errors.code?.message} {...register("code")} />
      <Input
        id="new_password"
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.new_password?.message}
        {...register("new_password")}
      />
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" loading={isSubmitting} className="mt-2">
        Reset password
      </Button>
    </form>
  );
}
