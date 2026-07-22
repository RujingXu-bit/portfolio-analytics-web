import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = dirname(fileURLToPath(import.meta.url));

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [path] : [];
    }),
  );
  return nested.flat();
}

describe("client token boundary", () => {
  it("keeps token and browser storage APIs out of client code and pages", async () => {
    const appPages = (await sourceFiles(resolve(root, "app"))).filter(
      (file) => !file.includes("/app/api/") && !file.endsWith(".test.ts"),
    );
    const files = [
      ...appPages,
      ...(await sourceFiles(resolve(root, "components"))).filter(
        (file) => !file.endsWith(".test.tsx"),
      ),
      ...(await sourceFiles(resolve(root, "lib/client"))).filter(
        (file) => !file.endsWith(".test.ts"),
      ),
    ];
    const content = (
      await Promise.all(files.map((file) => readFile(file, "utf8")))
    ).join("\n");

    expect(content).not.toMatch(/localStorage|sessionStorage/i);
    expect(content).not.toMatch(/access_token|authorization|portfolio_session/i);
    expect(content).not.toMatch(/console\.(log|info|debug|warn|error)/);
  });
});
