import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { LoginForm } from "@/components/storefront/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthCard title="Sign in" subtitle="Welcome back.">
      <LoginForm next={next ?? "/account"} />
    </AuthCard>
  );
}
