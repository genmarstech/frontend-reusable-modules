import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/storefront/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a code.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
