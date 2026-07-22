import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatMoney,
  formatPercent,
  formatRatio,
} from "@/lib/format";

describe("financial presentation formatters", () => {
  it("formats Decimal strings without changing the stored value", () => {
    expect(formatMoney("27842.63000000", "USD")).toBe("$27,842.63");
  });

  it("formats ratios and percentage values with explicit missing states", () => {
    expect(formatPercent(0.0842)).toBe("+8.42%");
    expect(formatPercent(-0.1198)).toBe("-11.98%");
    expect(formatPercent(null)).toBe("Not available");
    expect(formatRatio(0.714)).toBe("0.71");
  });

  it("formats API dates independently of the browser timezone", () => {
    expect(formatDate("2026-06-30")).toBe("30 Jun 2026");
  });
});
