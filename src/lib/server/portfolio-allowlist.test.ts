import { describe, expect, it } from "vitest";

import { resolvePortfolioBackendPath } from "@/lib/server/portfolio-allowlist";

const portfolioId = "5a419c0a-4f25-4b7f-bf77-7489fb2e3be8";

describe("portfolio BFF allowlist", () => {
  it.each([
    ["GET", undefined, "/portfolios"],
    ["POST", [], "/portfolios"],
    ["GET", [portfolioId], `/portfolios/${portfolioId}`],
    ["GET", [portfolioId, "transactions"], `/portfolios/${portfolioId}/transactions`],
    ["POST", [portfolioId, "transactions"], `/portfolios/${portfolioId}/transactions`],
    ["GET", [portfolioId, "analytics"], `/portfolios/${portfolioId}/analytics`],
    ["GET", [portfolioId, "insights"], `/portfolios/${portfolioId}/insights`],
    ["POST", [portfolioId, "insights"], `/portfolios/${portfolioId}/insights`],
    [
      "POST",
      [portfolioId, "transactions", "import", "preview"],
      `/portfolios/${portfolioId}/transactions/import/preview`,
    ],
    [
      "POST",
      [portfolioId, "transactions", "import"],
      `/portfolios/${portfolioId}/transactions/import`,
    ],
  ] as const)("allows %s %j", (method, segments, expected) => {
    expect(resolvePortfolioBackendPath(method, segments as string[] | undefined)).toBe(expected);
  });

  it.each([
    ["POST", [portfolioId]],
    ["POST", [portfolioId, "analytics"]],
    ["GET", [portfolioId, "delete"]],
    ["GET", ["not-a-uuid"]],
    ["GET", [portfolioId, "transactions", "extra"]],
    ["GET", [portfolioId, "transactions", "import"]],
    ["POST", [portfolioId, "transactions", "import", "commit"]],
    ["POST", [portfolioId, "transactions", "import", "preview", "extra"]],
  ] as const)("rejects %s %j", (method, segments) => {
    expect(resolvePortfolioBackendPath(method, [...segments])).toBeNull();
  });
});
