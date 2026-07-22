import type { Methodology } from "@/lib/api/types";
import { formatDate, formatPercent } from "@/lib/format";

export function MethodologyDetails({ methodology }: { methodology: Methodology }) {
  const rows = [
    ["Price basis", methodology.price_basis.replaceAll("_", " ")],
    ["Return type", methodology.return_type.replaceAll("_", " ")],
    ["Annualization", `${methodology.annualization_periods} trading periods`],
    ["Risk-free rate", `${formatPercent(Number(methodology.annual_risk_free_rate))} as of ${formatDate(methodology.risk_free_rate_as_of)}`],
    ["Valuation", methodology.valuation_method],
    ["Cash flows", methodology.cash_flow_policy],
    ["Fees", methodology.fee_policy],
    ["Date alignment", methodology.date_alignment_policy],
    ["Transaction timezone", methodology.transaction_date_timezone],
  ];

  return (
    <details className="group rounded-xl border border-slate-200 bg-slate-50">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-800 marker:hidden">
        <span className="flex items-center justify-between">
          Methodology and assumptions
          <span aria-hidden="true" className="text-lg text-slate-400 transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <dl className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div className="bg-white px-5 py-4" key={label}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1.5 text-sm leading-6 text-slate-700 first-letter:uppercase">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
        {methodology.risk_free_rate_assumption}
      </p>
    </details>
  );
}
