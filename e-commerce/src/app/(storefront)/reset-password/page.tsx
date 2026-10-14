import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { ResetPasswordForm } from "@/components/storefront/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthCard title="Enter your code" subtitle="Check your email for the 6-digit code.">
      <ResetPasswordForm defaultEmail={email ?? ""} />
    </AuthCard>
  );
}
