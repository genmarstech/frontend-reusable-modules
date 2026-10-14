import { NextResponse } from "next/server";
import { AuthServiceError, login } from "@/lib/auth-service";
import { setSessionCookies } from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const { access, refresh, user } = await login(email, password);
    await setSessionCookies(access, refresh);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    return NextResponse.json({ detail: "Could not reach the server. Try again." }, { status: 502 });
  }
}
