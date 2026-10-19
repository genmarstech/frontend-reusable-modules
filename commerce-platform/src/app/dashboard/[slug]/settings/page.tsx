import { ApiError, NetworkError } from "@/lib/api/client";
import { getOpsSettings } from "@/lib/api/ops/settings";
import { getAccessToken } from "@/lib/auth/session";
import { ErrorState } from "@/components/ui/States";
import { SettingsForm } from "./SettingsForm";
import type { StoreSettings } from "@/lib/api/types";

/**
 * core/views.py::StoreSettingsView is IsBusinessManager (owner/manager) —
 * a staff member reaching this page gets a real 403 from this call, not a
 * frontend guess; the layout's own nav already hides the link for staff,
 * but that's a convenience, not the authorization.
 */
export const instant = false;
export default async function OpsSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessToken = (await getAccessToken())!;

  let settings: StoreSettings;
  try {
    settings = await getOpsSettings(accessToken, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Staff settings are owner/manager only"
          detail="Ask a business owner or manager to make this change."
        />
      );
    }
    if (error instanceof ApiError) {
      return <ErrorState title={`Backend returned ${error.status}`} detail={error.message} />;
    }
    if (error instanceof NetworkError) {
      return <ErrorState title="Could not reach the backend" detail={error.message} />;
    }
    throw error;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Store settings</h2>
      <SettingsForm storeSlug={slug} settings={settings} />
    </div>
  );
}
