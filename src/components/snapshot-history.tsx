import { Clock3 } from "lucide-react";

import type { Snapshot } from "@/lib/api/types";
import { formatDate, formatDateTime, formatPercent } from "@/lib/format";

export function SnapshotHistory({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-9 text-center">
        <p className="font-semibold text-slate-800">No saved summaries</p>
        <p className="mt-2 text-sm text-slate-500">Generate a risk summary to create the first snapshot.</p>
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {snapshots.map((snapshot) => (
        <li className="rounded-xl border border-slate-200 bg-white p-5" key={snapshot.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">Snapshot · {formatDate(snapshot.as_of)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 aria-hidden="true" className="size-3.5" />Generated {formatDateTime(snapshot.generated_at)}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{snapshot.generator ?? "Legacy RC record"}</p>
              <p className="mt-1">{snapshot.model_name ?? snapshot.prompt_version ?? "Provenance unavailable"}</p>
            </div>
          </div>
          {snapshot.summary ? <p className="mt-4 text-sm leading-6 text-slate-700">{snapshot.summary}</p> : <p className="mt-4 text-sm italic text-slate-500">This release-candidate snapshot has no stored narrative.</p>}
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-slate-500">Return</dt><dd className="mt-1 font-semibold text-slate-800">{formatPercent(snapshot.metrics.simple_return)}</dd></div>
            <div><dt className="text-xs text-slate-500">Volatility</dt><dd className="mt-1 font-semibold text-slate-800">{formatPercent(snapshot.metrics.annualized_volatility)}</dd></div>
            <div><dt className="text-xs text-slate-500">Drawdown</dt><dd className="mt-1 font-semibold text-slate-800">{formatPercent(snapshot.metrics.max_drawdown)}</dd></div>
            <div><dt className="text-xs text-slate-500">Data</dt><dd className="mt-1 font-semibold text-slate-800">{snapshot.metrics.stale ? "Stale cache" : "Current at run"}</dd></div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
