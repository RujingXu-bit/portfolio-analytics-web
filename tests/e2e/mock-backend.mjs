import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

const token = "e2e-http-only-access-token";
const user = { id: randomUUID(), email: "candidate@example.com" };
const portfolios = [];
const transactions = new Map();
const snapshots = new Map();

const methodology = {
  annual_risk_free_rate: "0.04000000",
  risk_free_rate_as_of: "2026-01-01",
  risk_free_rate_assumption: "Fixed E2E test rate.",
  price_basis: "adjusted_close",
  return_type: "simple",
  annualization_periods: 252,
  valuation_method: "Daily transaction replay with adjusted close.",
  cash_flow_policy: "External cash flows excluded from returns.",
  fee_policy: "Fees reduce cash at transaction time.",
  date_alignment_policy: "Latest shared trading-date close.",
  transaction_date_timezone: "UTC",
};

function send(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "X-Request-ID": "e2e-request",
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function rawBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function csvRows(csv) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.replace(/^\uFEFF/, "").split(",");
  return lines.map((line, index) => {
    const values = line.split(",");
    return {
      row_number: index + 2,
      value: Object.fromEntries(headers.map((header, position) => [header, values[position] ?? ""])),
    };
  });
}

function authorized(request, response) {
  if (request.headers.authorization === `Bearer ${token}`) return true;
  send(response, 401, {
    error: { code: "authentication_failed", message: "invalid access token" },
  });
  return false;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:4100");
  if (url.pathname === "/health") return send(response, 200, { status: "ok" });
  if (url.pathname === "/auth/register" && request.method === "POST") {
    const input = await body(request);
    user.email = input.email;
    return send(response, 201, user);
  }
  if (url.pathname === "/auth/login" && request.method === "POST") {
    return send(response, 200, {
      access_token: token,
      token_type: "bearer",
      expires_in: 1800,
    });
  }
  if (!authorized(request, response)) return;

  if (url.pathname === "/portfolios" && request.method === "GET") {
    return send(response, 200, {
      items: [...portfolios].reverse(),
      total: portfolios.length,
      limit: Number(url.searchParams.get("limit") ?? 20),
      offset: Number(url.searchParams.get("offset") ?? 0),
    });
  }
  if (url.pathname === "/portfolios" && request.method === "POST") {
    const input = await body(request);
    const portfolio = {
      id: randomUUID(),
      name: input.name,
      base_currency: input.base_currency,
    };
    portfolios.push(portfolio);
    transactions.set(portfolio.id, []);
    snapshots.set(portfolio.id, []);
    return send(response, 201, portfolio);
  }

  const importMatch = url.pathname.match(
    /^\/portfolios\/([^/]+)\/transactions\/import(?:\/(preview))?$/,
  );
  if (importMatch && request.method === "POST") {
    const [, portfolioId, previewMode] = importMatch;
    const portfolio = portfolios.find((item) => item.id === portfolioId);
    if (!portfolio) {
      return send(response, 404, {
        error: { code: "portfolio_not_found", message: "portfolio not found" },
      });
    }
    const rows = csvRows(await rawBody(request));
    const current = transactions.get(portfolioId) ?? [];
    if (previewMode) {
      const results = rows.map(({ row_number, value }) => {
        const existing = current.find((item) => item.external_id === value.external_id);
        const invalid = value.transaction_type === "BUY" && !value.quantity;
        return {
          row_number,
          external_id: value.external_id || null,
          status: invalid ? "invalid" : existing ? "replay" : "ready",
          normalized: invalid
            ? null
            : {
                external_id: value.external_id,
                transaction_type: value.transaction_type,
                occurred_at: value.occurred_at,
                symbol: value.symbol || null,
                quantity: value.quantity || null,
                unit_price: value.unit_price || null,
                cash_amount: value.cash_amount || null,
                fees: value.fees || "0",
              },
          errors: invalid
            ? [{ code: "invalid_field", field: "quantity", message: "quantity is required" }]
            : [],
        };
      });
      return send(response, 200, {
        rows: results,
        summary: {
          total_rows: results.length,
          ready_rows: results.filter((row) => row.status === "ready").length,
          replay_rows: results.filter((row) => row.status === "replay").length,
          invalid_rows: results.filter((row) => row.status === "invalid").length,
        },
      });
    }
    const results = rows.map(({ row_number, value }) => {
      const existing = current.find((item) => item.external_id === value.external_id);
      const invalid = value.transaction_type === "BUY" && !value.quantity;
      if (invalid) {
        return {
          row_number,
          external_id: value.external_id || null,
          status: "failed",
          transaction: null,
          errors: [{ code: "invalid_field", field: "quantity", message: "quantity is required" }],
        };
      }
      const transaction = existing ?? {
        id: randomUUID(),
        portfolio_id: portfolioId,
        external_id: value.external_id,
        transaction_type: value.transaction_type,
        occurred_at: value.occurred_at,
        symbol: value.symbol || null,
        quantity: value.quantity || null,
        unit_price: value.unit_price || null,
        cash_amount: value.cash_amount || null,
        fees: value.fees || "0",
      };
      if (!existing) current.push(transaction);
      return {
        row_number,
        external_id: value.external_id,
        status: existing ? "replayed" : "created",
        transaction,
        errors: [],
      };
    });
    transactions.set(portfolioId, current);
    return send(response, 200, {
      rows: results,
      summary: {
        total_rows: results.length,
        created_rows: results.filter((row) => row.status === "created").length,
        replayed_rows: results.filter((row) => row.status === "replayed").length,
        failed_rows: results.filter((row) => row.status === "failed").length,
      },
    });
  }

  const match = url.pathname.match(
    /^\/portfolios\/([^/]+)(?:\/(transactions|analytics|insights))?$/,
  );
  if (!match) {
    return send(response, 404, {
      error: { code: "not_found", message: "not found" },
    });
  }
  const [, portfolioId, resource] = match;
  const portfolio = portfolios.find((item) => item.id === portfolioId);
  if (!portfolio) {
    return send(response, 404, {
      error: { code: "portfolio_not_found", message: "portfolio not found" },
    });
  }
  if (!resource && request.method === "GET") return send(response, 200, portfolio);

  if (resource === "transactions" && request.method === "GET") {
    return send(response, 200, transactions.get(portfolioId) ?? []);
  }
  if (resource === "transactions" && request.method === "POST") {
    const input = await body(request);
    const transaction = {
      id: randomUUID(),
      portfolio_id: portfolioId,
      external_id: input.external_id,
      transaction_type: input.transaction_type,
      occurred_at: input.occurred_at,
      symbol: input.symbol ?? null,
      quantity: input.quantity ?? null,
      unit_price: input.unit_price ?? null,
      cash_amount: input.cash_amount ?? null,
      fees: input.fees,
    };
    transactions.get(portfolioId).push(transaction);
    return send(response, 201, transaction);
  }

  const analytics = {
    as_of: "2026-06-30",
    simple_return: 0.0842,
    annualized_volatility: 0.1764,
    max_drawdown: -0.1198,
    sharpe_ratio: 0.71,
    portfolio_value: "27842.63000000",
    cash_balance: "15842.63000000",
    asset_weights: [
      { symbol: "AAPL", market_value: "12000.00000000", weight: "0.43099" },
    ],
    methodology,
    stale: false,
  };
  if (resource === "analytics" && request.method === "GET") {
    return send(response, 200, analytics);
  }
  if (resource === "insights" && request.method === "GET") {
    const items = snapshots.get(portfolioId) ?? [];
    return send(response, 200, {
      items: [...items].reverse(),
      total: items.length,
      limit: Number(url.searchParams.get("limit") ?? 20),
      offset: Number(url.searchParams.get("offset") ?? 0),
    });
  }
  if (resource === "insights" && request.method === "POST") {
    const insight = {
      as_of: analytics.as_of,
      risk_level: "moderate",
      summary:
        "The portfolio has moderate historical risk based on deterministic metrics.",
      key_factors: [
        "Annualized volatility is 17.64%.",
        "Maximum drawdown is 11.98%.",
      ],
      limitations: ["Historical metrics do not predict future performance."],
      disclaimer: "For information only. This is not investment advice.",
      generator: "deterministic_rules",
      model_name: null,
      prompt_version: "rules-v1",
      stale: false,
    };
    snapshots.get(portfolioId).push({
      id: randomUUID(),
      as_of: analytics.as_of,
      generated_at: "2026-06-30T16:10:00Z",
      metrics: {
        as_of: analytics.as_of,
        simple_return: analytics.simple_return,
        annualized_volatility: analytics.annualized_volatility,
        max_drawdown: analytics.max_drawdown,
        sharpe_ratio: analytics.sharpe_ratio,
        asset_weights: analytics.asset_weights.map(({ symbol, weight }) => ({
          symbol,
          weight,
        })),
        stale: false,
      },
      methodology,
      summary: insight.summary,
      generator: insight.generator,
      model_name: null,
      prompt_version: insight.prompt_version,
    });
    return send(response, 200, insight);
  }
  return send(response, 405, {
    error: { code: "method_not_allowed", message: "method not allowed" },
  });
});

server.listen(4100, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
