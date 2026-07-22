import type { components } from "@/lib/api/schema";

export type Portfolio = components["schemas"]["PortfolioResponse"];
export type PortfolioPage = components["schemas"]["PortfolioPageResponse"];
export type Transaction = components["schemas"]["TransactionResponse"];
export type TransactionInput = components["schemas"]["TransactionInput"];
export type TransactionType = components["schemas"]["TransactionType"];
export type Analytics = components["schemas"]["PortfolioAnalyticsResponse"];
export type Methodology = components["schemas"]["MethodologyResponse"];
export type AssetWeight = components["schemas"]["AssetWeightResponse"];
export type Insight = components["schemas"]["PortfolioInsightResponse"];
export type Snapshot = components["schemas"]["AnalysisSnapshotResponse"];
export type SnapshotPage = components["schemas"]["AnalysisSnapshotPageResponse"];

export interface SafeSession {
  authenticated: boolean;
  expires_in?: number;
}

export interface ApiErrorShape {
  error?: {
    code?: string;
    message?: string;
  };
}
