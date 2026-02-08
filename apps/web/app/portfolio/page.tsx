import type { Metadata } from "next";
import { Navbar, Footer } from "@/features/layout";
import { PortfolioDashboard } from "@/features/portfolio";

export const metadata: Metadata = {
  title: "Portfolio | Ammo Exchange",
  description:
    "View your ammunition token holdings, track orders, and manage your Ammo Exchange portfolio.",
};

export default function PortfolioPage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Navbar />
      <main className="flex-1">
        <PortfolioDashboard />
      </main>
      <Footer />
    </div>
  );
}
