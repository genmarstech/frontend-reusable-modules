import { AuthCard } from "@/components/storefront/auth/AuthCard";
import { RegisterForm } from "@/components/storefront/auth/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthCard title="Create an account" subtitle="Takes about a minute.">
      <RegisterForm next={next ?? "/account"} />
    </AuthCard>
  );
}
