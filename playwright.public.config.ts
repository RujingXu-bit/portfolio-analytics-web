import { defineConfig } from "@playwright/test";

const baseURL = process.env.PUBLIC_BASE_URL;

if (!baseURL) {
  throw new Error("PUBLIC_BASE_URL is required for public acceptance tests");
}

export default defineConfig({
  testDir: "./tests/public",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
