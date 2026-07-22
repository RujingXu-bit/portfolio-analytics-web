import type { Metadata } from "next";

import { PortfolioListPage } from "@/components/portfolio-list-page";

export const metadata: Metadata = { title: "Portfolios" };

export default function PortfoliosPage() {
  return <PortfolioListPage />;
}
