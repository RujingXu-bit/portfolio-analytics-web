import { describe, expect, it, vi } from "vitest";

import { bffFetch } from "@/lib/client/bff-fetch";

describe("bffFetch", () => {
  it("uses same-origin, no-store requests and redirects on 401", async () => {
    const unauthorized = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 401 }));

    await bffFetch("/api/portfolios", {}, unauthorized);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/portfolios",
      expect.objectContaining({ credentials: "same-origin", cache: "no-store" }),
    );
    expect(unauthorized).toHaveBeenCalledOnce();
  });
});
