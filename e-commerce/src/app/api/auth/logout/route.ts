import { NextResponse } from "next/server";
import { readSessionCookies, clearSessionCookies } from "@/lib/auth-cookies";
import { logout } from "@/lib/auth-service";

export async function POST() {
  const { refresh } = await readSessionCookies();
  if (refresh) await logout(refresh);
  await clearSessionCookies();
  return new NextResponse(null, { status: 204 });
}
