"use client";

import { ArrowLeft, BarChart3, History, LoaderCircle, Sparkles, WalletCards } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { AnalyticsResults } from "@/components/analytics-results";
import { InsightResults } from "@/components/insight-results";
import { SnapshotHistory } from "@/components/snapshot-history";
import { StatusBanner } from "@/components/status-banner";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionImport } from "@/components/transaction-import";
import { TransactionLedger } from "@/components/transaction-ledger";
import type { Analytics, Insight, Portfolio, SnapshotPage, Transaction } from "@/lib/api/types";
import { apiRequest, userFacingError } from "@/lib/client/api-client";

function analyticsPath(portfolioId: string, startDate: string, endDate: string) {
  const query = new URLSearchParams({ start_date: startDate, end_date: endDate });
  return `/api/portfolios/${portfolioId}/analytics?${query}`;
}

function insightsPath(portfolioId: string, startDate: string, endDate: string) {
  const query = new URLSearchParams({ start_date: startDate, end_date: endDate });
  return `/api/portfolios/${portfolioId}/insights?${query}`;
}

export function PortfolioDetailPage({ portfolioId }: { portfolioId: string }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotPage | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [runningAnalytics, setRunningAnalytics] = useState(false);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const loadSnapshots = useCallback(async () => {
    const page = await apiRequest<SnapshotPage>(
      `/api/portfolios/${portfolioId}/insights?limit=20&offset=0`,
    );
    setSnapshots(page);
  }, [portfolioId]);

  const loadTransactions = useCallback(async () => {
    const items = await apiRequest<Transaction[]>(
      `/api/portfolios/${portfolioId}/transactions`,
    );
    setTransactions(items);
  }, [portfolioId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Portfolio>(`/api/portfolios/${portfolioId}`),
      apiRequest<Transaction[]>(`/api/portfolios/${portfolioId}/transactions`),
      apiRequest<SnapshotPage>(`/api/portfolios/${portfolioId}/insights?limit=20&offset=0`),
    ])
      .then(([portfolioResult, transactionResult, snapshotResult]) => {
        if (!active) return;
        setPortfolio(portfolioResult);
        setTransactions(transactionResult);
        setSnapshots(snapshotResult);
      })
      .catch((requestError: unknown) => {
        if (active) setError(userFacingError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [portfolioId]);

  async function runAnalytics(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysisError(null);
    setRunningAnalytics(true);
    try {
      setAnalytics(
        await apiRequest<Analytics>(analyticsPath(portfolioId, startDate, endDate)),
      );
    } catch (requestError) {
      setAnalysisError(userFacingError(requestError));
    } finally {
      setRunningAnalytics(false);
    }
  }

  async function generateInsight() {
    setAnalysisError(null);
    setGeneratingInsight(true);
    try {
      const generated = await apiRequest<Insight>(
        insightsPath(portfolioId, startDate, endDate),
        { method: "POST" },
      );
      setInsight(generated);
      await loadSnapshots();
    } catch (requestError) {
      setAnalysisError(userFacingError(requestError));
    } finally {
      setGeneratingInsight(false);
    }
  }

  if (loading) {
    return <main className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-20 text-sm font-medium text-slate-600 sm:px-8 lg:px-10"><LoaderCircle aria-hidden="true" className="size-5 animate-spin text-emerald-700" />Loading portfolio workspace</main>;
  }
  if (error || !portfolio) {
    return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><StatusBanner tone="error" title="Portfolio unavailable">{error ?? "The portfolio could not be loaded."}</StatusBanner><Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 underline" href="/portfolios"><ArrowLeft aria-hidden="true" className="size-4" />Return to portfolios</Link></main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950" href="/portfolios"><ArrowLeft aria-hidden="true" className="size-4" />All portfolios</Link>
      <header className="mt-6 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
        <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Portfolio workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{portfolio.name}</h1><p className="mt-2 text-sm text-slate-500">{portfolio.base_currency} base currency · owner-scoped resource</p></div>
        <dl className="flex gap-8 text-sm"><div><dt className="text-slate-500">Ledger events</dt><dd className="mt-1 text-xl font-semibold text-slate-950">{transactions.length}</dd></div><div><dt className="text-slate-500">Saved snapshots</dt><dd className="mt-1 text-xl font-semibold text-slate-950">{snapshots?.total ?? 0}</dd></div></dl>
      </header>

      <div className="mt-10 space-y-14">
        <section aria-labelledby="ledger-title">
          <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <div className="mb-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800"><WalletCards aria-hidden="true" className="size-4" /></span><div><h2 className="text-xl font-semibold text-slate-950" id="ledger-title">Transaction ledger</h2><p className="mt-1 text-sm text-slate-500">Auditable inputs used to derive holdings</p></div></div>
              <TransactionLedger currency={portfolio.base_currency} transactions={transactions} />
            </div>
            <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:sticky lg:top-24"><h3 className="font-semibold text-slate-950">Record transaction</h3><p className="mt-2 text-sm leading-6 text-slate-500">Deposit cash before a purchase. Sales cannot exceed current holdings.</p><div className="mt-6"><TransactionForm onCreated={(created) => setTransactions((current) => [...current, created])} portfolioId={portfolioId} /></div></aside>
          </div>
          <div className="mt-7">
            <TransactionImport onCommitted={loadTransactions} portfolioId={portfolioId} />
          </div>
        </section>

        <section aria-labelledby="analytics-title">
          <div className="mb-6 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-blue-100 text-blue-800"><BarChart3 aria-hidden="true" className="size-4" /></span><div><h2 className="text-xl font-semibold text-slate-950" id="analytics-title">Historical analytics</h2><p className="mt-1 text-sm text-slate-500">Runs only when you explicitly request a date range</p></div></div>
          <form className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" onSubmit={runAnalytics}>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div><label className="text-sm font-semibold text-slate-800" htmlFor="start-date">Start date</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="start-date" onChange={(event) => setStartDate(event.target.value)} required type="date" value={startDate} /></div>
              <div><label className="text-sm font-semibold text-slate-800" htmlFor="end-date">End date</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="end-date" min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} required type="date" value={endDate} /></div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" disabled={runningAnalytics} type="submit">{runningAnalytics ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <BarChart3 aria-hidden="true" className="size-4" />}{runningAnalytics ? "Running" : "Run analytics"}</button>
            </div>
          </form>
          {analysisError ? <div className="mt-5"><StatusBanner tone="error">{analysisError}</StatusBanner></div> : null}
          {analytics ? <div className="mt-7"><AnalyticsResults analytics={analytics} currency={portfolio.base_currency} /></div> : <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"><BarChart3 aria-hidden="true" className="mx-auto size-7 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">No analysis has run</p><p className="mt-2 text-sm text-slate-500">Choose a date range, then explicitly run the calculation.</p></div>}
        </section>

        <section aria-labelledby="insights-title">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-violet-800"><Sparkles aria-hidden="true" className="size-4" /></span><div><h2 className="text-xl font-semibold text-slate-950" id="insights-title">Risk summary</h2><p className="mt-1 text-sm text-slate-500">Optional explanation of backend-computed metrics</p></div></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50" disabled={!startDate || !endDate || generatingInsight} onClick={generateInsight} type="button">{generatingInsight ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Sparkles aria-hidden="true" className="size-4" />}{generatingInsight ? "Generating" : "Generate risk summary"}</button></div>
          {!startDate || !endDate ? <StatusBanner tone="info">Select an analytics date range before generating a summary. The summary is never generated automatically.</StatusBanner> : null}
          {insight ? <InsightResults insight={insight} /> : null}
        </section>

        <section aria-labelledby="history-title">
          <div className="mb-6 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-slate-200 text-slate-800"><History aria-hidden="true" className="size-4" /></span><div><h2 className="text-xl font-semibold text-slate-950" id="history-title">Analysis history</h2><p className="mt-1 text-sm text-slate-500">Newest snapshots first, including legacy RC records</p></div></div>
          <SnapshotHistory snapshots={snapshots?.items ?? []} />
        </section>
      </div>
    </main>
  );
}
