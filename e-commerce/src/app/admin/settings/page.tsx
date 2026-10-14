import { djangoFetch } from "@/lib/django";
import type { StoreSettings } from "@/lib/types";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await djangoFetch<StoreSettings>("/api/ops/settings/", { cache: "no-store" });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text">Store settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
