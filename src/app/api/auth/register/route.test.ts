import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/register/route";

const originalBaseUrl = process.env.API_BASE_URL;
const originalOrigin = process.env.APP_ORIGIN;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
  if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalOrigin;
});

describe("POST /api/auth/register", () => {
  it("automatically logs in without returning the backend token", async () => {
    process.env.API_BASE_URL = "https://api.example";
    process.env.APP_ORIGIN = "https://portfolio.example";
    const token = "registration-auto-login-jwt";
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.json(
          { id: "5a419c0a-4f25-4b7f-bf77-7489fb2e3be8", email: "investor@example.com" },
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json({ access_token: token, token_type: "bearer", expires_in: 1800 }),
      );
    const request = new NextRequest("https://portfolio.example/api/auth/register", {
      method: "POST",
      headers: {
        Origin: "https://portfolio.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "investor@example.com", password: "long password" }),
    });

    const response = await POST(request);
    const bodyText = await response.text();

    expect(response.status).toBe(200);
    expect(bodyText).toContain("investor@example.com");
    expect(bodyText).not.toContain(token);
    expect(bodyText).not.toContain("access_token");
    expect(response.headers.get("set-cookie")).toContain(token);
  });
});
