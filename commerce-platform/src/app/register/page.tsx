import Link from "next/link";

import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-lg font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-500">
        One account works across every store on this platform.
      </p>

      <RegisterForm nextPath={next} />

      <p className="mt-4 text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
