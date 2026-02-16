import type { Metadata } from "next";
import { PortfolioDashboard } from "@/features/portfolio";

export const metadata: Metadata = {
  title: "Portfolio | Ammo Exchange",
  description:
    "View your ammunition token holdings, track orders, and manage your Ammo Exchange portfolio.",
};

export default function PortfolioPage() {
  return <PortfolioDashboard />;
}
