import "server-only";

import { apiFetch } from "../client";
import type { StoreSettings } from "../types";

/** GET/PATCH /api/ops/<slug>/settings/ — owner/manager only
 * (core/views.py::StoreSettingsView, IsBusinessManager). */
export function getOpsSettings(accessToken: string, businessSlug: string) {
  return apiFetch<StoreSettings>(`ops/${businessSlug}/settings/`, { accessToken });
}

export function updateOpsSettings(
  accessToken: string,
  businessSlug: string,
  input: Partial<StoreSettings>
) {
  return apiFetch<StoreSettings>(`ops/${businessSlug}/settings/`, {
    accessToken,
    method: "PATCH",
    body: input,
  });
}
