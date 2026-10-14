import { NextResponse } from "next/server";
import { AuthServiceError, register } from "@/lib/auth-service";
import { setSessionCookies } from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { access, refresh, user } = await register(body);
    await setSessionCookies(access, refresh);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return NextResponse.json({ detail: "Could not reach the server. Try again." }, { status: 502 });
  }
}
