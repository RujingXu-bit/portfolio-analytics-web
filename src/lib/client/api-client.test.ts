import { describe, expect, it } from "vitest";

import { ApiRequestError, userFacingError } from "@/lib/client/api-client";

describe("userFacingError", () => {
  it("includes Retry-After context for rate limits", () => {
    expect(
      userFacingError(new ApiRequestError("rate limited", 429, "rate_limited", 37)),
    ).toBe("Too many requests. Try again in 37 seconds.");
  });

  it("maps stable backend error codes to useful UI copy", () => {
    expect(
      userFacingError(
        new ApiRequestError(
          "provider failed",
          503,
          "market_data_unavailable",
          null,
        ),
      ),
    ).toContain("temporarily unavailable");
  });
});
