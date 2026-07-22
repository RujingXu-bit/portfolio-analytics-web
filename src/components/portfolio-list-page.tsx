"use client";

import { ArrowRight, BriefcaseBusiness, LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { StatusBanner } from "@/components/status-banner";
import type { Portfolio, PortfolioPage } from "@/lib/api/types";
import { apiRequest, jsonBody, userFacingError } from "@/lib/client/api-client";

export function PortfolioListPage() {
  const [page, setPage] = useState<PortfolioPage | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<PortfolioPage>("/api/portfolios?limit=100&offset=0")
      .then((result) => {
        if (active) setPage(result);
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
  }, []);

  async function createPortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const portfolio = await apiRequest<Portfolio>("/api/portfolios", {
        method: "POST",
        ...jsonBody({ name, base_currency: "USD" }),
      });
      setName("");
      setPage((current) => ({
        items: [portfolio, ...(current?.items ?? [])],
        total: (current?.total ?? 0) + 1,
        limit: 100,
        offset: 0,
      }));
    } catch (requestError) {
      setError(userFacingError(requestError));
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <section>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Private workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Your portfolios</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Each workspace has its own transaction ledger, historical analysis, and saved risk summaries.</p>
          {error ? <div className="mt-6"><StatusBanner tone="error">{error}</StatusBanner></div> : null}
          {loading ? (
            <div className="mt-10 flex items-center gap-3 text-sm font-medium text-slate-600"><LoaderCircle aria-hidden="true" className="size-5 animate-spin text-emerald-700" />Loading portfolios</div>
          ) : page?.items.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {page.items.map((portfolio) => (
                <Link className="group rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md" href={`/portfolios/${portfolio.id}`} key={portfolio.id}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800"><BriefcaseBusiness aria-hidden="true" className="size-5" /></span>
                    <ArrowRight aria-hidden="true" className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                  </div>
                  <h2 className="mt-8 text-lg font-semibold text-slate-950">{portfolio.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{portfolio.base_currency} base currency</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><BriefcaseBusiness aria-hidden="true" className="mx-auto size-8 text-slate-400" /><p className="mt-4 font-semibold text-slate-900">No portfolios yet</p><p className="mt-2 text-sm text-slate-500">Create one to begin a synthetic transaction ledger.</p></div>
          )}
        </section>
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:sticky lg:top-24">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800"><Plus aria-hidden="true" className="size-5" /></div>
          <h2 className="mt-5 text-lg font-semibold text-slate-950">Create portfolio</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">V1 uses USD as its single base currency.</p>
          <form className="mt-6 space-y-4" onSubmit={createPortfolio}>
            <div><label className="text-sm font-semibold text-slate-800" htmlFor="portfolio-name">Portfolio name</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm placeholder:text-slate-400" id="portfolio-name" maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Long-term Growth" required value={name} /></div>
            <div><label className="text-sm font-semibold text-slate-800" htmlFor="base-currency">Base currency</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-base text-slate-500" disabled id="base-currency" value="USD" /></div>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" disabled={creating} type="submit">{creating ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Plus aria-hidden="true" className="size-4" />}{creating ? "Creating" : "Create portfolio"}</button>
          </form>
        </aside>
      </div>
    </main>
  );
}
