import type { Metadata } from "next";
import { PortfolioDashboard } from "@/features/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Bullets on the blockchain. View your ammunition token holdings, track orders, and manage your Ammo Markets portfolio.",
};

export default function PortfolioPage() {
  return <PortfolioDashboard />;
}
