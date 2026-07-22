import type {
  Analytics,
  Insight,
  Methodology,
  Portfolio,
  Snapshot,
  Transaction,
} from "@/lib/api/types";

export const demoPortfolio: Portfolio = {
  id: "be9a91f5-39f2-40c7-b672-a724a5979e74",
  name: "Long-term Growth",
  base_currency: "USD",
};

export const demoTransactions: Transaction[] = [
  {
    id: "6b4dd15d-a507-4e29-9016-6f105fca44f0",
    portfolio_id: demoPortfolio.id,
    external_id: "fixture-deposit-001",
    transaction_type: "DEPOSIT",
    occurred_at: "2025-01-02T09:00:00Z",
    symbol: null,
    quantity: null,
    unit_price: null,
    cash_amount: "25000.00000000",
    fees: "0.00000000",
  },
  {
    id: "ea6514d6-0c43-4449-896f-4fb235e13b0a",
    portfolio_id: demoPortfolio.id,
    external_id: "fixture-buy-aapl-001",
    transaction_type: "BUY",
    occurred_at: "2025-01-03T14:30:00Z",
    symbol: "AAPL",
    quantity: "55.000000000000",
    unit_price: "184.25000000",
    cash_amount: null,
    fees: "4.95000000",
  },
  {
    id: "9063730b-cc37-4c64-9c9e-1a919da85e26",
    portfolio_id: demoPortfolio.id,
    external_id: "fixture-buy-msft-001",
    transaction_type: "BUY",
    occurred_at: "2025-01-06T14:30:00Z",
    symbol: "MSFT",
    quantity: "24.000000000000",
    unit_price: "421.10000000",
    cash_amount: null,
    fees: "4.95000000",
  },
];

export const demoMethodology: Methodology = {
  annual_risk_free_rate: "0.04000000",
  risk_free_rate_as_of: "2026-01-01",
  risk_free_rate_assumption:
    "Illustrative annual rate held constant over the analysis period.",
  price_basis: "adjusted_close",
  return_type: "simple",
  annualization_periods: 252,
  valuation_method: "Daily transaction replay with end-of-day adjusted close.",
  cash_flow_policy:
    "External deposits and withdrawals are excluded from investment returns.",
  fee_policy: "Transaction fees reduce cash at the transaction timestamp.",
  date_alignment_policy:
    "Assets use the latest available adjusted close on each shared trading date.",
  transaction_date_timezone: "UTC",
};

export const demoAnalytics: Analytics = {
  as_of: "2026-06-30",
  simple_return: 0.0842,
  annualized_volatility: 0.1764,
  max_drawdown: -0.1198,
  sharpe_ratio: 0.71,
  portfolio_value: "27842.63000000",
  cash_balance: "4741.30000000",
  asset_weights: [
    { symbol: "AAPL", market_value: "12542.33000000", weight: "0.450474" },
    { symbol: "MSFT", market_value: "10559.00000000", weight: "0.379238" },
  ],
  methodology: demoMethodology,
  stale: false,
};

export const demoInsight: Insight = {
  as_of: demoAnalytics.as_of,
  risk_level: "moderate",
  summary:
    "The portfolio shows moderate historical risk. Equity concentration is meaningful, while positive risk-adjusted return partially offsets the observed drawdown.",
  key_factors: [
    "Annualized volatility is 17.64%.",
    "Maximum drawdown reached 11.98% over the selected period.",
    "AAPL represents 45.05% of current portfolio value.",
  ],
  limitations: [
    "Historical metrics do not predict future performance.",
    "The fixture excludes taxes, currency conversion, and intraday pricing.",
  ],
  disclaimer:
    "For information and demonstration only. This is not investment advice.",
  generator: "deterministic_rules",
  model_name: null,
  prompt_version: "rules-v1",
  stale: false,
};

export const demoSnapshots: Snapshot[] = [
  {
    id: "af9b49bf-5991-43c6-bfc6-0443773f02fc",
    as_of: demoAnalytics.as_of,
    generated_at: "2026-06-30T16:10:00Z",
    metrics: {
      as_of: demoAnalytics.as_of,
      simple_return: demoAnalytics.simple_return,
      annualized_volatility: demoAnalytics.annualized_volatility,
      max_drawdown: demoAnalytics.max_drawdown,
      sharpe_ratio: demoAnalytics.sharpe_ratio,
      asset_weights: demoAnalytics.asset_weights.map(({ symbol, weight }) => ({
        symbol,
        weight,
      })),
      stale: false,
    },
    methodology: demoMethodology,
    summary: demoInsight.summary,
    generator: demoInsight.generator,
    model_name: null,
    prompt_version: demoInsight.prompt_version,
  },
];
