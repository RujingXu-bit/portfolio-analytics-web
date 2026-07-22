// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TransactionForm } from "@/components/transaction-form";

describe("TransactionForm", () => {
  it("switches between cash and trade-specific fields", async () => {
    const user = userEvent.setup();
    render(
      <TransactionForm
        onCreated={vi.fn()}
        portfolioId="5a419c0a-4f25-4b7f-bf77-7489fb2e3be8"
      />,
    );

    expect(screen.getByLabelText("Cash amount")).toBeInTheDocument();
    expect(screen.queryByLabelText("Symbol")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Transaction type"), "BUY");

    expect(screen.queryByLabelText("Cash amount")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Symbol")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit price")).toBeInTheDocument();
  });
});
