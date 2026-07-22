"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { FormEvent, useState } from "react";

import type { Transaction, TransactionInput, TransactionType } from "@/lib/api/types";
import { apiRequest, jsonBody, userFacingError } from "@/lib/client/api-client";

const transactionTypes: TransactionType[] = ["DEPOSIT", "BUY", "SELL", "WITHDRAWAL"];

export function TransactionForm({
  portfolioId,
  onCreated,
}: {
  portfolioId: string;
  onCreated: (transaction: Transaction) => void;
}) {
  const [type, setType] = useState<TransactionType>("DEPOSIT");
  const [occurredAt, setOccurredAt] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [fees, setFees] = useState("0");
  const [externalId, setExternalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isTrade = type === "BUY" || type === "SELL";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const stableExternalId = externalId || `web-${crypto.randomUUID()}`;
    setExternalId(stableExternalId);
    const payload: TransactionInput = {
      external_id: stableExternalId,
      transaction_type: type,
      occurred_at: new Date(occurredAt).toISOString(),
      fees,
      ...(isTrade
        ? {
            symbol: symbol.trim().toUpperCase(),
            quantity,
            unit_price: unitPrice,
          }
        : { cash_amount: cashAmount }),
    };

    try {
      const created = await apiRequest<Transaction>(
        `/api/portfolios/${portfolioId}/transactions`,
        { method: "POST", ...jsonBody(payload) },
      );
      onCreated(created);
      setExternalId("");
      setSymbol("");
      setQuantity("");
      setUnitPrice("");
      setCashAmount("");
      setFees("0");
    } catch (requestError) {
      setError(userFacingError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label className="text-sm font-semibold text-slate-800" htmlFor="transaction-type">Transaction type</label>
        <select className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm" id="transaction-type" onChange={(event) => setType(event.target.value as TransactionType)} value={type}>
          {transactionTypes.map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-800" htmlFor="occurred-at">Date and time</label>
        <input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="occurred-at" onChange={(event) => setOccurredAt(event.target.value)} required type="datetime-local" value={occurredAt} />
        <p className="mt-2 text-xs leading-5 text-slate-500">Entered in your local timezone and stored with an explicit UTC offset.</p>
      </div>
      {isTrade ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div><label className="text-sm font-semibold text-slate-800" htmlFor="symbol">Symbol</label><input autoCapitalize="characters" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base uppercase shadow-sm" id="symbol" maxLength={32} onChange={(event) => setSymbol(event.target.value)} placeholder="AAPL" required value={symbol} /></div>
          <div><label className="text-sm font-semibold text-slate-800" htmlFor="quantity">Quantity</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="quantity" min="0.000000000001" onChange={(event) => setQuantity(event.target.value)} required step="any" type="number" value={quantity} /></div>
          <div><label className="text-sm font-semibold text-slate-800" htmlFor="unit-price">Unit price</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="unit-price" min="0.00000001" onChange={(event) => setUnitPrice(event.target.value)} required step="any" type="number" value={unitPrice} /></div>
        </div>
      ) : (
        <div><label className="text-sm font-semibold text-slate-800" htmlFor="cash-amount">Cash amount</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="cash-amount" min="0.00000001" onChange={(event) => setCashAmount(event.target.value)} required step="any" type="number" value={cashAmount} /></div>
      )}
      <div><label className="text-sm font-semibold text-slate-800" htmlFor="fees">Fees</label><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-base shadow-sm" id="fees" min="0" onChange={(event) => setFees(event.target.value)} required step="any" type="number" value={fees} /></div>
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p> : null}
      <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" disabled={submitting} type="submit">{submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Plus aria-hidden="true" className="size-4" />}{submitting ? "Recording" : "Record transaction"}</button>
      <p className="text-xs leading-5 text-slate-500">A stable idempotency reference is retained if submission fails, preventing accidental duplicate ledger entries on retry.</p>
    </form>
  );
}
