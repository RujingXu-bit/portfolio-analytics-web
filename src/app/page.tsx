import {
  ArrowRight,
  Braces,
  Database,
  Gauge,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { PublicHeader } from "@/components/public-header";
import { demoAnalytics } from "@/lib/demo-fixture";
import { formatMoney, formatPercent, formatRatio } from "@/lib/format";

const metrics = [
  ["Simple return", formatPercent(demoAnalytics.simple_return)],
  ["Annual volatility", formatPercent(demoAnalytics.annualized_volatility)],
  ["Max drawdown", formatPercent(demoAnalytics.max_drawdown)],
  ["Sharpe ratio", formatRatio(demoAnalytics.sharpe_ratio)],
];

const architecture = [
  { icon: Braces, title: "Next.js BFF", detail: "HttpOnly session boundary" },
  { icon: ServerCog, title: "FastAPI", detail: "Modular application services" },
  { icon: Database, title: "PostgreSQL", detail: "Precise Decimal ledger" },
  { icon: Gauge, title: "Redis", detail: "Caching and rate limits" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="surface-grid overflow-hidden bg-[#0b1426] text-white">
        <PublicHeader inverse />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:pt-20">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Explainable by design
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
              Portfolio risk without the black box.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Record a transaction ledger, calculate reproducible historical metrics, and generate a
              bounded risk summary built from numbers you can inspect.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300" href="/demo">
                Explore the offline demo <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" href="/register">
                Create a demo account
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-emerald-300" />Deterministic calculations</span>
              <span className="inline-flex items-center gap-2"><LockKeyhole aria-hidden="true" className="size-4 text-emerald-300" />Owner-scoped resources</span>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div aria-hidden="true" className="absolute -inset-12 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950 shadow-2xl shadow-black/25">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Long-term Growth</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMoney(demoAnalytics.portfolio_value)}</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">Fixture preview</span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <div className="bg-white px-4 py-5" key={label}>
                    <p className="text-xs leading-5 text-slate-500">{label}</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 bg-slate-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Methodology travels with every result</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Adjusted close · simple daily returns · 252 periods</p>
                </div>
                <div className="flex h-12 items-end gap-1" aria-hidden="true">
                  {[38, 52, 45, 64, 58, 76, 69, 83, 78, 91].map((height, index) => (
                    <span className="w-2 rounded-sm bg-emerald-600/80" key={`${height}-${index}`} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">System boundary</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">A full-stack project with restrained architecture.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-600 lg:justify-self-end">
              Financial metrics remain deterministic pure functions. Market data, persistence, caching,
              authentication, and optional language-model explanations sit behind explicit interfaces,
              with a safe rule-based fallback.
            </p>
          </div>
          <div className="mt-12 grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {architecture.map(({ icon: Icon, title, detail }) => (
              <article className="bg-white p-6" key={title}>
                <Icon aria-hidden="true" className="size-6 text-emerald-700" />
                <h3 className="mt-8 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-[#f4f7f9]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-3 lg:px-10 lg:py-24">
            <div>
              <p className="text-5xl font-semibold tracking-tight text-slate-950">4</p>
              <h3 className="mt-4 font-semibold text-slate-900">Core risk metrics</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Return, annualized volatility, drawdown, and Sharpe ratio with edge-case tests.</p>
            </div>
            <div>
              <p className="text-5xl font-semibold tracking-tight text-slate-950">0</p>
              <h3 className="mt-4 font-semibold text-slate-900">Forecasting claims</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">No price prediction, automated trading, or guaranteed outcomes.</p>
            </div>
            <div>
              <p className="text-5xl font-semibold tracking-tight text-slate-950">1</p>
              <h3 className="mt-4 font-semibold text-slate-900">Inspectable ledger</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Idempotent transactions replayed into portfolio value without look-ahead bias.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 sm:py-28 lg:px-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">See the complete flow</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Start with a fixture. Continue with your own demo ledger.</h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600">Use synthetic values only. Public demo data can be reset and the application is not a financial adviser.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800" href="/demo">Open offline demo</Link>
            <a className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-500" href="https://github.com/RujingXu-bit/portfolio-analytics-web">Frontend on GitHub</a>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Portfolio Analytics · Engineering demonstration</p>
          <p>Historical analysis, not investment advice.</p>
        </div>
      </footer>
    </div>
  );
}
