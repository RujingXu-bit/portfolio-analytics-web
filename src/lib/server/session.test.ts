import { NextResponse } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import {
  clearSessionCookie,
  SESSION_COOKIE_NAME,
  setSessionCookie,
} from "@/lib/server/session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session cookie", () => {
  it("is HttpOnly, Secure, SameSite=Lax, path-scoped, and short-lived", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = NextResponse.json({ authenticated: true });

    setSessionCookie(response, "secret-token", 1800);

    const header = response.headers.get("set-cookie") ?? "";
    expect(header).toContain(`${SESSION_COOKIE_NAME}=secret-token`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=lax");
    expect(header).toContain("Path=/");
    expect(header).toContain("Max-Age=1800");
  });

  it("expires the cookie when a backend session is rejected", () => {
    const response = NextResponse.json({ authenticated: false });
    clearSessionCookie(response);
    const header = response.headers.get("set-cookie") ?? "";

    expect(header).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(header).toContain("Max-Age=0");
    expect(header).toContain("HttpOnly");
  });
});
