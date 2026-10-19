import { NextRequest, NextResponse } from "next/server";

import { ApiError, NetworkError } from "@/lib/api/client";
import { backendLogin } from "@/lib/auth/backend";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/csrf";

/**
 * The BFF login endpoint. Calls the verified backend login endpoint
 * server-side, then sets the session as httpOnly cookies — the response
 * body sent back to the browser carries the user's profile and NOTHING
 * else. `access`/`refresh` never leave this function.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: "Request origin could not be verified." }, { status: 403 });
  }

  let email: unknown;
  let password: unknown;
  try {
    const body = await request.json();
    email = body?.email;
    password = body?.password;
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await backendLogin(email, password);

    const response = NextResponse.json({ user: result.user }, { status: 200 });
    response.cookies.set(ACCESS_COOKIE, result.access, sessionCookieOptions(ACCESS_COOKIE_MAX_AGE_SECONDS));
    response.cookies.set(REFRESH_COOKIE, result.refresh, sessionCookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS));
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Forwards the backend's own {detail} or {field: [...]} shape
      // unchanged — core/exceptions.py's error bodies are already safe to
      // show a user, and re-wrapping them here would just be a second
      // place for the two shapes to drift apart.
      return NextResponse.json(error.body, { status: error.status });
    }
    if (error instanceof NetworkError) {
      return NextResponse.json({ detail: error.message }, { status: 503 });
    }
    throw error;
  }
}
