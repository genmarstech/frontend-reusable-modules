import { NextRequest, NextResponse } from "next/server";

import { ApiError, NetworkError } from "@/lib/api/client";
import { backendRegister } from "@/lib/auth/backend";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/csrf";

/**
 * The BFF register endpoint — same shape and same cookie-setting as
 * /api/auth/login (the backend hands back an identical {user, access,
 * refresh} for both, see accounts/views.py::RegisterView), so a successful
 * registration signs the caller straight in rather than bouncing them to a
 * separate login step for an account that was just proven to be theirs.
 */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: "Request origin could not be verified." }, { status: 403 });
  }

  let email: unknown;
  let password: unknown;
  let firstName: unknown;
  let lastName: unknown;
  let phoneNumber: unknown;
  try {
    const body = await request.json();
    email = body?.email;
    password = body?.password;
    firstName = body?.first_name;
    lastName = body?.last_name;
    phoneNumber = body?.phone_number;
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
  }

  try {
    const result = await backendRegister({
      email,
      password,
      first_name: typeof firstName === "string" ? firstName : undefined,
      last_name: typeof lastName === "string" ? lastName : undefined,
      phone_number: typeof phoneNumber === "string" ? phoneNumber : undefined,
    });

    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.cookies.set(ACCESS_COOKIE, result.access, sessionCookieOptions(ACCESS_COOKIE_MAX_AGE_SECONDS));
    response.cookies.set(REFRESH_COOKIE, result.refresh, sessionCookieOptions(REFRESH_COOKIE_MAX_AGE_SECONDS));
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Forwards the backend's own {detail} (e.g. "email already exists")
      // or {field: [...]} (password-strength validation) unchanged — same
      // reasoning as the login route's own comment.
      return NextResponse.json(error.body, { status: error.status });
    }
    if (error instanceof NetworkError) {
      return NextResponse.json({ detail: error.message }, { status: 503 });
    }
    throw error;
  }
}
