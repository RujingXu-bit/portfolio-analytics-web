import { DashboardShell } from "@/components/dashboard-shell";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
