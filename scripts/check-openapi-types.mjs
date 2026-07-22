import { readFile, rm } from "node:fs/promises";

const generatedPath = new URL("../.openapi-types.tmp.d.ts", import.meta.url);
const committedPath = new URL("../src/lib/api/schema.d.ts", import.meta.url);

try {
  const [generated, committed] = await Promise.all([
    readFile(generatedPath, "utf8"),
    readFile(committedPath, "utf8"),
  ]);
  if (generated !== committed) {
    console.error(
      "Generated API types have drifted. Run `pnpm api:types:generate` and commit the result.",
    );
    process.exitCode = 1;
  }
} finally {
  await rm(generatedPath, { force: true });
}
