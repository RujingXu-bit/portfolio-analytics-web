import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/portfolios/[[...segments]]/route";

const originalBaseUrl = process.env.API_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

describe("portfolio BFF proxy", () => {
  it("adds the bearer token server-side and never returns it", async () => {
    process.env.API_BASE_URL = "https://api.example";
    const token = "private-cookie-jwt";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ items: [], total: 0, limit: 20, offset: 0 }),
    );
    const request = new NextRequest(
      "https://portfolio.example/api/portfolios?limit=20&offset=0",
      { headers: { Cookie: `portfolio_session=${token}` } },
    );

    const response = await GET(request, {
      params: Promise.resolve({ segments: undefined }),
    });
    const bodyText = await response.text();
    const backendInit = fetchMock.mock.calls[0]?.[1];
    const backendHeaders = new Headers(backendInit?.headers);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(bodyText).not.toContain(token);
    expect(backendHeaders.get("authorization")).toBe(`Bearer ${token}`);
  });

  it("clears the cookie when FastAPI returns 401", async () => {
    process.env.API_BASE_URL = "https://api.example";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { error: { code: "authentication_failed", message: "invalid access token" } },
        { status: 401 },
      ),
    );
    const request = new NextRequest("https://portfolio.example/api/portfolios", {
      headers: { Cookie: "portfolio_session=expired-jwt" },
    });

    const response = await GET(request, {
      params: Promise.resolve({ segments: undefined }),
    });

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects cross-origin portfolio writes before contacting FastAPI", async () => {
    process.env.API_BASE_URL = "https://api.example";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const request = new NextRequest("https://portfolio.example/api/portfolios", {
      method: "POST",
      headers: {
        Cookie: "portfolio_session=private-cookie-jwt",
        Origin: "https://evil.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Long-term", base_currency: "USD" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ segments: undefined }),
    });

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects non-JSON portfolio writes", async () => {
    process.env.API_BASE_URL = "https://api.example";
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const request = new NextRequest("https://portfolio.example/api/portfolios", {
      method: "POST",
      headers: {
        Cookie: "portfolio_session=private-cookie-jwt",
        Origin: "https://portfolio.example",
        "Content-Type": "text/plain",
      },
      body: "not json",
    });

    const response = await POST(request, {
      params: Promise.resolve({ segments: undefined }),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
