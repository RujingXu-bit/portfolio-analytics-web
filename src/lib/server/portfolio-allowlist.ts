import "server-only";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AllowedMethod = "GET" | "POST";

export function resolvePortfolioBackendPath(
  method: AllowedMethod,
  segments: string[] | undefined,
): string | null {
  const parts = segments ?? [];
  if (parts.length === 0) {
    return method === "GET" || method === "POST" ? "/portfolios" : null;
  }

  const [portfolioId, resource] = parts;
  if (!portfolioId || !UUID_PATTERN.test(portfolioId)) return null;

  if (parts.length === 1) {
    return method === "GET" ? `/portfolios/${portfolioId}` : null;
  }
  if (parts.length !== 2 || !resource) return null;

  if (resource === "transactions") {
    return `/portfolios/${portfolioId}/transactions`;
  }
  if (resource === "analytics" && method === "GET") {
    return `/portfolios/${portfolioId}/analytics`;
  }
  if (resource === "insights") {
    return `/portfolios/${portfolioId}/insights`;
  }
  return null;
}
