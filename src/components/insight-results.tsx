import { Bot, ShieldCheck } from "lucide-react";

import { StatusBanner } from "@/components/status-banner";
import type { Insight } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export function InsightResults({ insight }: { insight: Insight }) {
  const deterministic = insight.generator === "deterministic_rules";
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
        <div className="flex gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
            {deterministic ? <ShieldCheck aria-hidden="true" className="size-5" /> : <Bot aria-hidden="true" className="size-5" />}
          </span>
          <div>
            <h3 className="font-semibold text-slate-950">Risk summary</h3>
            <p className="mt-1 text-sm text-slate-500">{formatDate(insight.as_of)} · {insight.risk_level.toLowerCase()} risk</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p className="font-semibold text-slate-700">{deterministic ? "Deterministic fallback" : insight.generator}</p>
          <p className="mt-1">{insight.model_name ?? insight.prompt_version}</p>
        </div>
      </header>
      <div className="space-y-6 px-5 py-6 sm:px-6">
        <p className="text-base leading-7 text-slate-800">{insight.summary}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Key factors</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {insight.key_factors.map((factor) => <li className="flex gap-2" key={factor}><span aria-hidden="true" className="text-emerald-700">•</span>{factor}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Limitations</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {insight.limitations.map((limitation) => <li className="flex gap-2" key={limitation}><span aria-hidden="true" className="text-amber-700">•</span>{limitation}</li>)}
            </ul>
          </div>
        </div>
        <StatusBanner tone="warning">{insight.disclaimer}</StatusBanner>
      </div>
    </article>
  );
}
