import type { Transaction } from "@/lib/api/types";
import { formatDateTime, formatMoney, formatTransactionType } from "@/lib/format";

function transactionValue(transaction: Transaction): string {
  if (transaction.cash_amount !== null) return transaction.cash_amount;
  if (transaction.quantity !== null && transaction.unit_price !== null) {
    return String(Number(transaction.quantity) * Number(transaction.unit_price));
  }
  return "0";
}

export function TransactionLedger({ transactions, currency }: { transactions: Transaction[]; currency: string }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="font-semibold text-slate-800">No transactions yet</p>
        <p className="mt-2 text-sm text-slate-500">Add a deposit before recording a purchase.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <caption className="sr-only">Portfolio transaction ledger</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3" scope="col">Date</th>
            <th className="px-5 py-3" scope="col">Type</th>
            <th className="px-5 py-3" scope="col">Asset</th>
            <th className="px-5 py-3 text-right" scope="col">Quantity</th>
            <th className="px-5 py-3 text-right" scope="col">Gross value</th>
            <th className="px-5 py-3 text-right" scope="col">Fees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <tr className="text-slate-700" key={transaction.id}>
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDateTime(transaction.occurred_at)}</td>
              <td className="px-5 py-4"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{formatTransactionType(transaction.transaction_type)}</span></td>
              <td className="px-5 py-4 font-semibold text-slate-900">{transaction.symbol ?? "Cash"}</td>
              <td className="px-5 py-4 text-right tabular-nums">{transaction.quantity === null ? "—" : Number(transaction.quantity).toLocaleString("en-US", { maximumFractionDigits: 6 })}</td>
              <td className="px-5 py-4 text-right font-medium tabular-nums text-slate-900">{formatMoney(transactionValue(transaction), currency)}</td>
              <td className="px-5 py-4 text-right tabular-nums text-slate-500">{formatMoney(transaction.fees, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
