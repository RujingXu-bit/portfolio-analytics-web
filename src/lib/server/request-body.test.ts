import { describe, expect, it } from "vitest";

import {
  InvalidCsvBodyError,
  MAX_CSV_BODY_BYTES,
  readCsvBody,
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

describe("readCsvBody", () => {
  it("preserves the exact bytes of an allowed CSV body", async () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x2c, 0x62, 0x0a]);
    const request = new Request("https://portfolio.example/api/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv; charset=utf-8" },
      body: bytes,
    });

    expect(new Uint8Array(await readCsvBody(request))).toEqual(bytes);
  });

  it.each([
    ["wrong media type", "application/json", "a,b\n"],
    ["empty body", "text/csv", ""],
    ["oversized body", "text/csv", "x".repeat(MAX_CSV_BODY_BYTES + 1)],
  ])("rejects %s", async (_name, contentType, body) => {
    const request = new Request("https://portfolio.example/api/import", {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });

    await expect(readCsvBody(request)).rejects.toBeInstanceOf(InvalidCsvBodyError);
  });
});
