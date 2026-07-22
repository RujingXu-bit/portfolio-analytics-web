import { expect, test } from "@playwright/test";

test("new visitor completes the public portfolio workflow", async ({
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
  await expect(page.getByText(/use synthetic information only/i)).toBeVisible();

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  await page.getByLabel("Email address").fill(`public-${suffix}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill("Public demo password 2026");
  await page.getByLabel("Confirm password").fill("Public demo password 2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/portfolios$/);

  const sessionCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "portfolio_session",
  );
  expect(sessionCookie).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
  expect(await page.evaluate(() => document.cookie)).not.toContain("portfolio_session");
  const webStorage = await page.evaluate(() => ({
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage),
  }));
  expect(JSON.stringify(webStorage)).not.toMatch(/access[_-]?token|bearer|jwt/i);

  await page.getByLabel("Portfolio name").fill("Public Acceptance Portfolio");
  await page.getByRole("button", { name: "Create portfolio" }).click();
  await expect(page).toHaveURL(/\/portfolios\/[0-9a-f-]+$/);

  await page.getByLabel("Date and time").fill("2026-01-02T09:00");
  await page.getByLabel("Cash amount").fill("2000");
  await page.getByRole("button", { name: "Record transaction" }).click();
  await expect(page.getByRole("cell", { name: "Deposit" })).toBeVisible();

  await page.getByLabel("Transaction type").selectOption("BUY");
  await page.getByLabel("Date and time").fill("2026-01-03T14:30");
  await page.getByLabel("Symbol").fill("MSFT");
  await page.getByLabel("Quantity").fill("5");
  await page.getByLabel("Unit price").fill("180");
  await page.getByLabel("Fees").fill("1");
  await page.getByRole("button", { name: "Record transaction" }).click();
  await expect(page.getByRole("cell", { name: "MSFT" })).toBeVisible();

  await page.getByLabel("Start date").fill("2026-01-02");
  await page.getByLabel("End date").fill("2026-01-30");
  await page.getByRole("button", { name: "Run analytics" }).click();
  await expect(page.getByText("Methodology and assumptions")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("img", { name: /Asset allocation/ })).toBeVisible();
  await page.getByText("Methodology and assumptions").click();
  await expect(page.getByText(/Adjusted close/i)).toBeVisible();

  await page.getByRole("button", { name: "Generate risk summary" }).click();
  await expect(page.getByText("Deterministic fallback")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Snapshot · 30 Jan 2026")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Snapshot · 30 Jan 2026")).toBeVisible();
  expect(apiBodies.join("\n")).not.toMatch(/access[_-]?token|bearer\s+ey|portfolio_session/i);
});

for (const viewport of [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test(`public offline demo fits ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: "Long-term Growth" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
