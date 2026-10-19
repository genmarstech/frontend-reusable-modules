"use server";

import { revalidatePath } from "next/cache";

import { addOpsMember, removeOpsMember, updateOpsMember } from "@/lib/api/ops/members";
import { ApiError, NetworkError } from "@/lib/api/client";
import { requireAccessToken } from "@/lib/auth/requireAccessToken";

export interface MemberActionResult {
  error?: string;
  success?: boolean;
}

/**
 * All three actions are owner-only on the backend (businesses/ops_urls.py
 * -> OpsMembershipViewSet, IsBusinessOwner for anything but a SAFE read) —
 * a manager or staff member submitting one of these gets a real 403 back,
 * surfaced inline, never silently dropped.
 */
export async function addMemberAction(
  _previousState: MemberActionResult,
  formData: FormData
): Promise<MemberActionResult> {
  const storeSlug = String(formData.get("storeSlug"));
  const returnPath = `/dashboard/${storeSlug}/members`;
  const accessToken = await requireAccessToken(returnPath);

  const userId = Number(formData.get("userId"));
  const role = String(formData.get("role"));
  if (!Number.isFinite(userId) || userId <= 0) {
    return { error: "Enter a valid user id." };
  }

  try {
    await addOpsMember(accessToken, storeSlug, userId, role);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    if (error instanceof NetworkError) return { error: error.message };
    throw error;
  }

  revalidatePath(returnPath);
  return { success: true };
}

export async function changeRoleAction(storeSlug: string, membershipId: number, formData: FormData) {
  const returnPath = `/dashboard/${storeSlug}/members`;
  const accessToken = await requireAccessToken(returnPath);
  const role = String(formData.get("role"));

  await updateOpsMember(accessToken, storeSlug, membershipId, { role });
  revalidatePath(returnPath);
}

export async function suspendMemberAction(storeSlug: string, membershipId: number) {
  const returnPath = `/dashboard/${storeSlug}/members`;
  const accessToken = await requireAccessToken(returnPath);

  await updateOpsMember(accessToken, storeSlug, membershipId, { status: "suspended" });
  revalidatePath(returnPath);
}

export async function reactivateMemberAction(storeSlug: string, membershipId: number) {
  const returnPath = `/dashboard/${storeSlug}/members`;
  const accessToken = await requireAccessToken(returnPath);

  await updateOpsMember(accessToken, storeSlug, membershipId, { status: "active" });
  revalidatePath(returnPath);
}

export async function removeMemberAction(storeSlug: string, membershipId: number) {
  const returnPath = `/dashboard/${storeSlug}/members`;
  const accessToken = await requireAccessToken(returnPath);

  await removeOpsMember(accessToken, storeSlug, membershipId);
  revalidatePath(returnPath);
}
