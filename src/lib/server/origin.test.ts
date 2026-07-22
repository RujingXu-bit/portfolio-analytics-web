import { afterEach, describe, expect, it } from "vitest";

import { InvalidOriginError, requireSameOrigin } from "@/lib/server/origin";

const originalOrigin = process.env.APP_ORIGIN;

afterEach(() => {
  if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalOrigin;
});

describe("requireSameOrigin", () => {
  it("accepts the exact configured origin", () => {
    process.env.APP_ORIGIN = "https://portfolio.example";
    const request = new Request("https://internal.example/api/auth/login", {
      method: "POST",
      headers: { Origin: "https://portfolio.example" },
    });

    expect(() => requireSameOrigin(request)).not.toThrow();
  });

  it.each([undefined, "null", "https://evil.example", "https://portfolio.example/path"])(
    "rejects an untrusted Origin: %s",
    (origin) => {
      process.env.APP_ORIGIN = "https://portfolio.example";
      const headers = origin ? { Origin: origin } : undefined;
      const request = new Request("https://portfolio.example/api/auth/login", {
        method: "POST",
        headers,
      });

      expect(() => requireSameOrigin(request)).toThrow(InvalidOriginError);
    },
  );
});
