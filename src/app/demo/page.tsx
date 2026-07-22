import { FlaskConical } from "lucide-react";
import Link from "next/link";

import { AnalyticsResults } from "@/components/analytics-results";
import { InsightResults } from "@/components/insight-results";
import { PublicHeader } from "@/components/public-header";
import { SnapshotHistory } from "@/components/snapshot-history";
import { StatusBanner } from "@/components/status-banner";
import { TransactionLedger } from "@/components/transaction-ledger";
import {
  demoAnalytics,
  demoInsight,
  demoPortfolio,
  demoSnapshots,
  demoTransactions,
} from "@/lib/demo-fixture";

export const metadata = {
  title: "Offline Demo",
  description: "A deterministic, network-independent Ledger Lens fixture.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      <div className="border-b border-slate-200 bg-white"><PublicHeader /></div>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <StatusBanner tone="info" title="Deterministic offline fixture">
          This page makes no network or provider calls. Every value is a fixed synthetic sample for
          demonstration and outage fallback—not a live portfolio result.
        </StatusBanner>
        <div className="mt-10 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"><FlaskConical aria-hidden="true" className="size-4" />Offline demo workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{demoPortfolio.name}</h1>
            <p className="mt-2 text-sm text-slate-500">Synthetic ledger · {demoPortfolio.base_currency} base currency</p>
          </div>
          <Link className="inline-flex justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800" href="/register">Build your own demo</Link>
        </div>

        <div className="mt-10 space-y-12">
          <section aria-labelledby="demo-analytics-title">
            <div className="mb-5"><h2 className="text-xl font-semibold text-slate-950" id="demo-analytics-title">Historical analytics</h2><p className="mt-1 text-sm text-slate-500">Fixed period: 02 Jan 2025 – 30 Jun 2026</p></div>
            <AnalyticsResults
              analytics={demoAnalytics}
              currency={demoPortfolio.base_currency}
              provenance="fixture"
            />
          </section>
          <section aria-labelledby="demo-insight-title">
            <h2 className="sr-only" id="demo-insight-title">Risk insight</h2>
            <InsightResults insight={demoInsight} />
          </section>
          <section aria-labelledby="demo-ledger-title">
            <div className="mb-5"><h2 className="text-xl font-semibold text-slate-950" id="demo-ledger-title">Transaction ledger</h2><p className="mt-1 text-sm text-slate-500">The auditable source of portfolio state</p></div>
            <TransactionLedger currency={demoPortfolio.base_currency} transactions={demoTransactions} />
          </section>
          <section aria-labelledby="demo-history-title">
            <div className="mb-5"><h2 className="text-xl font-semibold text-slate-950" id="demo-history-title">Analysis history</h2><p className="mt-1 text-sm text-slate-500">Saved calculation and narrative provenance</p></div>
            <SnapshotHistory snapshots={demoSnapshots} />
          </section>
        </div>
      </main>
    </div>
  );
}
