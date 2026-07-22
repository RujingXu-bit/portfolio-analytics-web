// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TransactionImport, validateCsvFile } from "@/components/transaction-import";

const previewResponse = {
  rows: [
    {
      row_number: 2,
      external_id: "deposit-001",
      status: "ready",
      normalized: {
        external_id: "deposit-001",
        transaction_type: "DEPOSIT",
        occurred_at: "2026-01-02T09:00:00Z",
        symbol: null,
        quantity: null,
        unit_price: null,
        cash_amount: "25000.00",
        fees: "0",
      },
      errors: [],
    },
    {
      row_number: 3,
      external_id: "bad-buy",
      status: "invalid",
      normalized: null,
      errors: [{ code: "invalid_field", field: "quantity", message: "quantity is required" }],
    },
  ],
  summary: { total_rows: 2, ready_rows: 1, replay_rows: 0, invalid_rows: 1 },
};

const commitResponse = {
  rows: [
    {
      row_number: 2,
      external_id: "deposit-001",
      status: "created",
      transaction: {
        id: "4b57ea70-a6b0-4ddd-8d74-127c1fd5e8f4",
        portfolio_id: "5a419c0a-4f25-4b7f-bf77-7489fb2e3be8",
        external_id: "deposit-001",
        transaction_type: "DEPOSIT",
        occurred_at: "2026-01-02T09:00:00Z",
        symbol: null,
        quantity: null,
        unit_price: null,
        cash_amount: "25000.00",
        fees: "0",
      },
      errors: [],
    },
    {
      row_number: 3,
      external_id: "bad-buy",
      status: "failed",
      transaction: null,
      errors: [{ code: "invalid_field", field: "quantity", message: "quantity is required" }],
    },
  ],
  summary: { total_rows: 2, created_rows: 1, replayed_rows: 0, failed_rows: 1 },
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TransactionImport", () => {
  it("previews the selected bytes before commit and refreshes the ledger", async () => {
    const user = userEvent.setup();
    const onCommitted = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json(previewResponse))
      .mockResolvedValueOnce(Response.json(commitResponse));
    render(
      <TransactionImport
        onCommitted={onCommitted}
        portfolioId="5a419c0a-4f25-4b7f-bf77-7489fb2e3be8"
      />,
    );
    const file = new File(
      [
        "external_id,transaction_type,occurred_at,symbol,quantity,unit_price,cash_amount,fees\n",
        "deposit-001,DEPOSIT,2026-01-02T09:00:00Z,,,,25000,0\n",
      ],
      "transactions.csv",
      { type: "text/csv" },
    );

    await user.upload(screen.getByLabelText("CSV file"), file);
    expect(screen.getByRole("button", { name: "Commit 0 rows" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Preview import" }));

    expect(await screen.findByText("quantity: quantity is required")).toBeVisible();
    expect(screen.getByRole("button", { name: "Commit 1 row" })).toBeEnabled();
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(file);

    await user.click(screen.getByRole("button", { name: "Commit 1 row" }));

    expect(await screen.findByText(/1 created, 0 replayed, and 1 failed/)).toBeVisible();
    expect(fetchMock.mock.calls[1]?.[1]?.body).toBe(file);
    await waitFor(() => expect(onCommitted).toHaveBeenCalledOnce());
  });

  it("invalidates an old preview when the file changes", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(previewResponse));
    render(
      <TransactionImport
        onCommitted={vi.fn().mockResolvedValue(undefined)}
        portfolioId="5a419c0a-4f25-4b7f-bf77-7489fb2e3be8"
      />,
    );
    const input = screen.getByLabelText("CSV file");
    await user.upload(input, new File(["a,b\n"], "first.csv", { type: "text/csv" }));
    await user.click(screen.getByRole("button", { name: "Preview import" }));
    expect(await screen.findByRole("button", { name: "Commit 1 row" })).toBeEnabled();

    await user.upload(input, new File(["c,d\n"], "second.csv", { type: "text/csv" }));

    expect(screen.getByRole("button", { name: "Commit 0 rows" })).toBeDisabled();
    expect(screen.queryByText("quantity: quantity is required")).not.toBeInTheDocument();
  });
});

describe("validateCsvFile", () => {
  it("rejects non-CSV, empty, and oversized files", () => {
    expect(validateCsvFile(new File(["x"], "notes.txt", { type: "text/plain" }))).toMatch(/\.csv/);
    expect(validateCsvFile(new File([], "empty.csv", { type: "text/csv" }))).toMatch(/empty/);
    expect(
      validateCsvFile(new File([new Uint8Array(1_000_001)], "large.csv", { type: "text/csv" })),
    ).toMatch(/1 MB/);
  });
});
