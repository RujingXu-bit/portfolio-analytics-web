"use client";

import { Eye, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { ChangeEvent, useState } from "react";

import { StatusBanner } from "@/components/status-banner";
import type {
  TransactionImportCommit,
  TransactionImportCommitRow,
  TransactionImportPreview,
  TransactionImportPreviewRow,
} from "@/lib/api/types";
import { apiRequest, userFacingError } from "@/lib/client/api-client";

const MAX_CSV_BYTES = 1_000_000;

export function validateCsvFile(file: File): string | null {
  const hasCsvName = file.name.toLowerCase().endsWith(".csv");
  const hasCsvType = file.type === "text/csv" || file.type === "application/vnd.ms-excel";
  if (!hasCsvName && !hasCsvType) return "Choose a .csv file.";
  if (file.size === 0) return "The CSV file is empty.";
  if (file.size > MAX_CSV_BYTES) return "The CSV file must be 1 MB or smaller.";
  return null;
}

function statusStyle(status: string): string {
  if (status === "ready" || status === "created") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "replay" || status === "replayed") {
    return "bg-blue-100 text-blue-800";
  }
  return "bg-red-100 text-red-800";
}

function RowStatus({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${statusStyle(status)}`}
    >
      {status}
    </span>
  );
}

function rowDescription(
  row: TransactionImportPreviewRow | TransactionImportCommitRow,
): string {
  if (row.errors.length > 0) {
    return row.errors
      .map((issue) => `${issue.field ? `${issue.field}: ` : ""}${issue.message}`)
      .join(" · ");
  }
  if ("normalized" in row && row.normalized) {
    const value = row.normalized;
    return [value.transaction_type, value.symbol, value.cash_amount ?? value.quantity]
      .filter(Boolean)
      .join(" · ");
  }
  if ("transaction" in row && row.transaction) {
    return `${row.transaction.transaction_type} · saved transaction ${row.transaction.id}`;
  }
  return "No row details returned.";
}

function ImportRows({
  rows,
}: {
  rows: Array<TransactionImportPreviewRow | TransactionImportCommitRow>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <caption className="sr-only">CSV transaction import row results</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3" scope="col">Row</th>
            <th className="px-4 py-3" scope="col">External ID</th>
            <th className="px-4 py-3" scope="col">Status</th>
            <th className="px-4 py-3" scope="col">Normalized value or issue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr className="align-top text-slate-700" key={`${row.row_number}-${row.external_id ?? "missing"}`}>
              <td className="px-4 py-4 font-mono text-xs text-slate-500">{row.row_number}</td>
              <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-900">
                {row.external_id ?? "—"}
              </td>
              <td className="px-4 py-4"><RowStatus status={row.status} /></td>
              <td className="max-w-xl px-4 py-4 leading-6">{rowDescription(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionImport({
  portfolioId,
  onCommitted,
}: {
  portfolioId: string;
  onCommitted: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TransactionImportPreview | null>(null);
  const [result, setResult] = useState<TransactionImportCommit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setPreview(null);
    setResult(null);
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    const validationError = validateCsvFile(selected);
    if (validationError) {
      setFile(null);
      setError(validationError);
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function previewFile() {
    if (!file) return;
    setError(null);
    setResult(null);
    setPreviewing(true);
    try {
      const response = await apiRequest<TransactionImportPreview>(
        `/api/portfolios/${portfolioId}/transactions/import/preview`,
        { method: "POST", headers: { "Content-Type": "text/csv" }, body: file },
      );
      setPreview(response);
    } catch (requestError) {
      setPreview(null);
      setError(userFacingError(requestError));
    } finally {
      setPreviewing(false);
    }
  }

  async function commitFile() {
    if (!file || !preview) return;
    setError(null);
    setCommitting(true);
    try {
      const response = await apiRequest<TransactionImportCommit>(
        `/api/portfolios/${portfolioId}/transactions/import`,
        { method: "POST", headers: { "Content-Type": "text/csv" }, body: file },
      );
      setResult(response);
      try {
        await onCommitted();
      } catch {
        setError(
          "Transactions were imported, but the ledger could not be refreshed. Reload the page to see the latest rows.",
        );
      }
    } catch (requestError) {
      setError(userFacingError(requestError));
    } finally {
      setCommitting(false);
    }
  }

  const committableRows = preview
    ? preview.summary.ready_rows + preview.summary.replay_rows
    : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
            <FileSpreadsheet aria-hidden="true" className="size-4" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-950">Import transactions from CSV</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Preview every row before committing. Invalid rows are explained and skipped;
              stable external IDs make retries idempotent.
            </p>
          </div>
        </div>
        <a
          className="text-sm font-semibold text-emerald-800 underline underline-offset-4"
          download
          href="/transaction-import-template.csv"
        >
          Download template
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <label className="text-sm font-semibold text-slate-800" htmlFor="transaction-csv">
            CSV file
          </label>
          <input
            accept=".csv,text/csv"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-4 file:py-3 file:font-semibold file:text-slate-800"
            id="transaction-csv"
            onChange={chooseFile}
            type="file"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            UTF-8 CSV, up to 1 MB and 500 non-empty rows. Required columns: external_id,
            transaction_type, occurred_at, symbol, quantity, unit_price, cash_amount, fees.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!file || previewing || committing}
            onClick={previewFile}
            type="button"
          >
            {previewing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Eye aria-hidden="true" className="size-4" />}
            {previewing ? "Previewing" : "Preview import"}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!preview || committableRows === 0 || previewing || committing}
            onClick={commitFile}
            type="button"
          >
            {committing ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Upload aria-hidden="true" className="size-4" />}
            {committing
              ? "Importing"
              : `Commit ${committableRows} ${committableRows === 1 ? "row" : "rows"}`}
          </button>
        </div>
      </div>

      {file ? <p className="mt-3 text-xs font-medium text-slate-600">Selected: {file.name} · {(file.size / 1024).toFixed(1)} KB</p> : null}
      {error ? <div className="mt-5"><StatusBanner tone="error">{error}</StatusBanner></div> : null}

      {preview ? (
        <div className="mt-6 space-y-4" aria-live="polite">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Total", preview.summary.total_rows],
              ["Ready", preview.summary.ready_rows],
              ["Replay", preview.summary.replay_rows],
              ["Invalid", preview.summary.invalid_rows],
            ].map(([label, value]) => (
              <div className="rounded-lg bg-slate-50 px-4 py-3" key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {preview.summary.invalid_rows > 0 ? (
            <StatusBanner tone="warning">
              Invalid rows will be skipped. Review each issue before committing the valid rows.
            </StatusBanner>
          ) : (
            <StatusBanner tone="success">Preview complete. No invalid rows were found.</StatusBanner>
          )}
          <ImportRows rows={preview.rows} />
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4" aria-live="polite">
          <StatusBanner tone={result.summary.failed_rows > 0 ? "warning" : "success"} title="Import finished">
            {result.summary.created_rows} created, {result.summary.replayed_rows} replayed, and {result.summary.failed_rows} failed. The ledger has been refreshed.
          </StatusBanner>
          <ImportRows rows={result.rows} />
        </div>
      ) : null}
    </div>
  );
}
