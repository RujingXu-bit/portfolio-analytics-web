import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = dirname(fileURLToPath(import.meta.url));

describe("client token boundary", () => {
  it("keeps token and browser storage APIs out of client code and pages", async () => {
    const files = [
      "app/page.tsx",
      "app/login/page.tsx",
      "lib/client/bff-fetch.ts",
    ];
    const content = (
      await Promise.all(files.map((file) => readFile(resolve(root, file), "utf8")))
    ).join("\n");

    expect(content).not.toMatch(/localStorage|sessionStorage/i);
    expect(content).not.toMatch(/access_token|authorization|portfolio_session/i);
    expect(content).not.toMatch(/console\.(log|info|debug|warn|error)/);
  });
});
