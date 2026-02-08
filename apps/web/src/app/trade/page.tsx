import type { Metadata } from "next";
import { Navbar } from "@/components/ammo/navbar";
import { Footer } from "@/components/ammo/footer";
import { TradeDemo } from "./trade-demo";

export const metadata: Metadata = {
  title: "Trade | Ammo Exchange",
  description:
    "Swap ammo tokens on decentralized exchanges or lend and borrow against your holdings.",
};

export default function TradePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        className="flex flex-1 flex-col items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl text-balance"
            style={{ color: "var(--text-primary)" }}
          >
            Trade Ammo Tokens
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Swap between calibers and USDC, or use your tokens as collateral on
            Aave.
          </p>
        </div>
        <TradeDemo />
      </main>
      <Footer />
    </div>
  );
}
