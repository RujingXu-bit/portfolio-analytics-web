import { Database, History } from "lucide-react";

import { AllocationChart } from "@/components/allocation-chart";
import { MethodologyDetails } from "@/components/methodology";
import { MetricCard } from "@/components/metric-card";
import { StatusBanner } from "@/components/status-banner";
import type { Analytics } from "@/lib/api/types";
import { formatDate, formatMoney, formatPercent, formatRatio } from "@/lib/format";

export function AnalyticsResults({
  analytics,
  currency,
  provenance = "provider",
}: {
  analytics: Analytics;
  currency: string;
  provenance?: "provider" | "fixture";
}) {
  return (
    <div className="space-y-6">
      {analytics.stale ? (
        <StatusBanner tone="warning" title="Using stale market data">
          The provider was unavailable, so this result uses a previously cached price series. The
          calculation remains deterministic, but data provenance is not current.
        </StatusBanner>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Analysis as of</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{formatDate(analytics.as_of)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          {analytics.stale ? <History aria-hidden="true" className="size-4" /> : <Database aria-hidden="true" className="size-4" />}
          {provenance === "fixture"
            ? "Deterministic fixture series"
            : analytics.stale
              ? "Cached historical series"
              : "Provider-backed historical series"}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Simple return" value={formatPercent(analytics.simple_return)} detail="External cash flows excluded" />
        <MetricCard label="Annual volatility" value={formatPercent(analytics.annualized_volatility)} detail="252-period annualization" />
        <MetricCard label="Maximum drawdown" value={formatPercent(analytics.max_drawdown)} detail="Largest peak-to-trough decline" />
        <MetricCard label="Sharpe ratio" value={formatRatio(analytics.sharpe_ratio)} detail="Return above configured risk-free rate" />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Current allocation</h3>
            <p className="mt-1 text-sm text-slate-500">Market value plus available cash</p>
          </div>
          <p className="text-sm text-slate-500">
            Cash <strong className="text-slate-800">{formatMoney(analytics.cash_balance, currency)}</strong>
          </p>
        </div>
        <AllocationChart
          cashBalance={analytics.cash_balance}
          currency={currency}
          portfolioValue={analytics.portfolio_value}
          weights={analytics.asset_weights}
        />
      </section>
      <MethodologyDetails methodology={analytics.methodology} />
    </div>
  );
}
