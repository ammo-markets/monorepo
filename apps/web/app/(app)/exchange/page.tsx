import type { Metadata } from "next";
import { Suspense } from "react";
import { TradePageClient } from "./trade-client";

export const metadata: Metadata = {
  title: "Trade",
  description:
    "Bullets on the blockchain. Mint, redeem, or swap ammo tokens on Avalanche from a unified trading page.",
};

export default function TradePage() {
  return (
    <Suspense>
      <TradePageClient />
    </Suspense>
  );
}
