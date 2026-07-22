import "server-only";

import type { NextResponse } from "next/server";

import { sessionCookieIsSecure } from "@/lib/server/config";

export const SESSION_COOKIE_NAME = "portfolio_session";

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: sessionCookieIsSecure(),
    sameSite: "lax" as const,
    path: "/",
    priority: "high" as const,
  };
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresInSeconds: number,
): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: expiresInSeconds,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...baseCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
