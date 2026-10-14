"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { readableErrorMessage } from "@/lib/errors";

const schema = z.object({
  first_name: z.string().min(1, "Required."),
  last_name: z.string().min(1, "Required."),
  email: z.string().email("Enter a valid email address."),
  phone_number: z.string().min(1, "Required."),
  password: z.string().min(8, "At least 8 characters."),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm({ next }: { next: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setServerError(readableErrorMessage(data, "Could not create your account."));
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input id="first_name" label="First name" error={errors.first_name?.message} {...register("first_name")} />
        <Input id="last_name" label="Last name" error={errors.last_name?.message} {...register("last_name")} />
      </div>
      <Input id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input
        id="phone_number"
        label="Phone number"
        placeholder="0712345678"
        error={errors.phone_number?.message}
        {...register("phone_number")}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" loading={isSubmitting} className="mt-2">
        Create account
      </Button>
      <p className="text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
