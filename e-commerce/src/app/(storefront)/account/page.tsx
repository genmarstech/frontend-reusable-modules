import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { djangoFetch } from "@/lib/django";
import type { Address } from "@/lib/types";
import { ProfileForm } from "@/components/storefront/account/ProfileForm";
import { AddressManager } from "@/components/storefront/account/AddressManager";
import { LogoutButton } from "@/components/storefront/LogoutButton";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const addresses = await djangoFetch<{ results: Address[] }>("/api/addresses/", { cache: "no-store" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-text">Account</h1>
        <LogoutButton />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text">Profile</h2>
        <ProfileForm user={user} />
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <AddressManager addresses={addresses.results} />
      </section>
    </div>
  );
}
