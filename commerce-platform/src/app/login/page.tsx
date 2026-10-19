import Link from "next/link";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-500">Sign in to your account.</p>

      {reason === "session_expired" && (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your session expired. Please sign in again.
        </p>
      )}

      <LoginForm nextPath={next} />

      <p className="mt-4 text-sm text-neutral-500">
        New here?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-neutral-900 underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
