import type { AssetWeight } from "@/lib/api/types";
import { formatMoney, formatPercent } from "@/lib/format";

const colors = ["#087b61", "#2563a7", "#7c5eb5", "#c7781a", "#6b7280", "#0f766e"];

export function AllocationChart({
  weights,
  currency,
  cashBalance,
  portfolioValue,
}: {
  weights: AssetWeight[];
  currency: string;
  cashBalance: string;
  portfolioValue: string;
}) {
  const total = Number(portfolioValue);
  const cashWeight = total > 0 ? Math.max(0, Number(cashBalance) / total) : 0;
  const entries = [
    ...weights.map((weight) => ({
      label: weight.symbol,
      value: Number(weight.weight),
      amount: weight.market_value,
    })),
    ...(cashWeight > 0.0001
      ? [{ label: "Cash", value: cashWeight, amount: cashBalance }]
      : []),
  ];
  let cursor = 0;
  const gradient = entries
    .map((entry, index) => {
      const start = cursor;
      cursor += entry.value * 100;
      return `${colors[index % colors.length]} ${start}% ${Math.min(cursor, 100)}%`;
    })
    .join(", ");

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[180px_1fr]">
      <div
        aria-label={`Asset allocation: ${entries.map((entry) => `${entry.label} ${formatPercent(entry.value)}`).join(", ")}`}
        className="relative mx-auto size-44 rounded-full"
        role="img"
        style={{ background: `conic-gradient(${gradient || "#e2e8f0 0 100%"})` }}
      >
        <div className="absolute inset-8 grid place-items-center rounded-full bg-white text-center shadow-inner">
          <span className="text-xs font-medium text-slate-500">Total value</span>
          <strong className="mt-0.5 block text-sm text-slate-950">
            {formatMoney(portfolioValue, currency)}
          </strong>
        </div>
      </div>
      <ul className="space-y-3" aria-label="Allocation legend">
        {entries.map((entry, index) => (
          <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm" key={entry.label}>
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="font-medium text-slate-700">{entry.label}</span>
            <span className="text-right">
              <span className="font-semibold text-slate-950">{formatPercent(entry.value)}</span>
              <span className="ml-2 hidden text-slate-500 lg:inline">
                {formatMoney(entry.amount, currency)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
