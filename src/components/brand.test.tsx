// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Brand } from "@/components/brand";

describe("Brand", () => {
  it("renders the Ledger Lens name and initials", () => {
    render(<Brand />);

    expect(screen.getByRole("link", { name: "Ledger Lens home" })).toBeVisible();
    expect(screen.getByText("LL")).toBeVisible();
    expect(screen.getByText("Ledger Lens")).toBeVisible();
  });
});
