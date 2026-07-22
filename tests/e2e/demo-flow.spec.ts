import { expect, test } from "@playwright/test";

test("new visitor completes registration through snapshot history", async ({
  context,
  page,
}) => {
  const apiBodies: string[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/api/")) {
      apiBodies.push(await response.text().catch(() => ""));
    }
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Portfolio risk without the black box." }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAttribute("href");
  await page.getByRole("link", { name: "Create a demo account" }).click();

  await page.getByLabel("Email address").fill("candidate@example.com");
  await page.getByLabel("Password", { exact: true }).fill("portfolio demo password");
  await page.getByLabel("Confirm password").fill("portfolio demo password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/portfolios$/);

  const sessionCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "portfolio_session",
  );
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("portfolio_session");
  const webStorage = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
  }));
  expect(JSON.stringify(webStorage)).not.toContain("e2e-http-only-access-token");
  expect(JSON.stringify(webStorage)).not.toContain("access_token");

  await page.getByLabel("Portfolio name").fill("Interview Demo");
  await page.getByRole("button", { name: "Create portfolio" }).click();
  await page.getByRole("link", { name: /Interview Demo/ }).click();
  await expect(page.getByRole("heading", { name: "Interview Demo" })).toBeVisible();

  await page.getByLabel("Date and time").fill("2025-01-02T09:00");
  await page.getByLabel("Cash amount").fill("25000");
  await page.getByRole("button", { name: "Record transaction" }).click();
  await expect(page.getByRole("cell", { name: "Deposit" })).toBeVisible();

  await page.getByLabel("Transaction type").selectOption("BUY");
  await page.getByLabel("Date and time").fill("2025-01-03T14:30");
  await page.getByLabel("Symbol").fill("AAPL");
  await page.getByLabel("Quantity").fill("50");
  await page.getByLabel("Unit price").fill("180");
  await page.getByRole("button", { name: "Record transaction" }).click();
  await expect(page.getByRole("cell", { name: "AAPL" })).toBeVisible();

  await page.getByLabel("Start date").fill("2025-01-02");
  await page.getByLabel("End date").fill("2026-06-30");
  await page.getByRole("button", { name: "Run analytics" }).click();
  await expect(page.getByText("+8.42%")).toBeVisible();
  await expect(page.getByRole("img", { name: /Asset allocation/ })).toBeVisible();
  await expect(page.getByText("Methodology and assumptions")).toBeVisible();

  await page.getByRole("button", { name: "Generate risk summary" }).click();
  await expect(
    page
      .getByRole("region", { name: "Risk summary" })
      .getByText(/moderate historical risk/),
  ).toBeVisible();
  await expect(page.getByText("Deterministic fallback")).toBeVisible();
  await expect(page.getByText("Snapshot · 30 Jun 2026")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Snapshot · 30 Jun 2026")).toBeVisible();
  expect(apiBodies.join("\n")).not.toContain("e2e-http-only-access-token");
});

for (const viewport of [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`offline demo fits ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: "Long-term Growth" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
