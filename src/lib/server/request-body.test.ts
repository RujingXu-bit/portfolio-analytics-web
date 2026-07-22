import { describe, expect, it } from "vitest";

import {
  requireEmptyBody,
  UnexpectedRequestBodyError,
} from "@/lib/server/request-body";

describe("requireEmptyBody", () => {
  it("accepts missing and zero-length POST bodies", async () => {
    await expect(
      requireEmptyBody(new Request("https://app.example/insights", { method: "POST" })),
    ).resolves.toBeUndefined();
    await expect(
      requireEmptyBody(
        new Request("https://app.example/insights", { method: "POST", body: "" }),
      ),
    ).resolves.toBeUndefined();
  });

  it("rejects any non-empty body", async () => {
    await expect(
      requireEmptyBody(
        new Request("https://app.example/insights", {
          method: "POST",
          body: "{}",
        }),
      ),
    ).rejects.toBeInstanceOf(UnexpectedRequestBodyError);
  });
});
