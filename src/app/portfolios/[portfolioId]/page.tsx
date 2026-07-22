import type { Metadata } from "next";

import { PortfolioDetailPage } from "@/components/portfolio-detail-page";

export const metadata: Metadata = { title: "Portfolio workspace" };

export default async function PortfolioPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = await params;
  return <PortfolioDetailPage portfolioId={portfolioId} />;
}
