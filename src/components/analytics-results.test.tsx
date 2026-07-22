// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsResults } from "@/components/analytics-results";
import { demoAnalytics } from "@/lib/demo-fixture";

describe("AnalyticsResults", () => {
  it("renders all four metrics and stale provenance", () => {
    render(
      <AnalyticsResults
        analytics={{ ...demoAnalytics, stale: true }}
        currency="USD"
      />,
    );

    expect(screen.getByText("Simple return")).toBeInTheDocument();
    expect(screen.getByText("Annual volatility")).toBeInTheDocument();
    expect(screen.getByText("Maximum drawdown")).toBeInTheDocument();
    expect(screen.getByText("Sharpe ratio")).toBeInTheDocument();
    expect(screen.getByText("Using stale market data")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Asset allocation/ })).toBeInTheDocument();
  });

  it("labels the offline sample without implying a provider call", () => {
    render(
      <AnalyticsResults
        analytics={demoAnalytics}
        currency="USD"
        provenance="fixture"
      />,
    );

    expect(screen.getByText("Deterministic fixture series")).toBeInTheDocument();
    expect(screen.queryByText("Provider-backed historical series")).not.toBeInTheDocument();
  });
});
