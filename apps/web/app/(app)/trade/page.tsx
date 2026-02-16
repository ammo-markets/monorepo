import type { Metadata } from "next";
import { Suspense } from "react";
import { TradePageClient } from "./trade-client";

export const metadata: Metadata = {
  title: "Trade | Ammo Exchange",
  description:
    "Mint, redeem, or swap ammo tokens from a single unified trading page.",
};

export default function TradePage() {
  return (
    <Suspense>
      <TradePageClient />
    </Suspense>
  );
}
