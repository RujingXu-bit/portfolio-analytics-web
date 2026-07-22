import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/login/route";

const originalBaseUrl = process.env.API_BASE_URL;
const originalOrigin = process.env.APP_ORIGIN;
const originalSecure = process.env.SESSION_COOKIE_SECURE;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
  if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalOrigin;
  if (originalSecure === undefined) delete process.env.SESSION_COOKIE_SECURE;
  else process.env.SESSION_COOKIE_SECURE = originalSecure;
});

describe("POST /api/auth/login", () => {
  it("stores the token only in the HttpOnly cookie", async () => {
    process.env.API_BASE_URL = "https://api.example";
    process.env.APP_ORIGIN = "https://portfolio.example";
    process.env.SESSION_COOKIE_SECURE = "true";
    const token = "backend-jwt-that-must-not-reach-javascript";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ access_token: token, token_type: "bearer", expires_in: 1800 }),
    );
    const request = new NextRequest("https://portfolio.example/api/auth/login", {
      method: "POST",
      headers: {
        Origin: "https://portfolio.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "investor@example.com", password: "long password" }),
    });

    const response = await POST(request);
    const bodyText = await response.text();
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(bodyText).not.toContain(token);
    expect(bodyText).not.toContain("access_token");
    expect(cookie).toContain(token);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://api.example/auth/login"),
      expect.objectContaining({ credentials: "omit", cache: "no-store" }),
    );
  });

  it("rejects a cross-origin write before contacting the backend", async () => {
    process.env.APP_ORIGIN = "https://portfolio.example";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const request = new NextRequest("https://portfolio.example/api/auth/login", {
      method: "POST",
      headers: {
        Origin: "https://evil.example",
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
