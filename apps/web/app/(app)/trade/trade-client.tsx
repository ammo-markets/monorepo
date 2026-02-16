"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMarketData } from "@/hooks/use-market-data";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useAuth } from "@/contexts/auth-context";
import { TradeTabs } from "@/features/trade";
import type { Caliber } from "@ammo-exchange/shared";

type TradeTab = "mint" | "redeem" | "swap";

export function TradePageClient() {
  const { data: marketData = [] } = useMarketData();
  const tokenBalances = useTokenBalances();
  const { isConnected } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(() => {
    const param = searchParams.get("caliber")?.toUpperCase() as Caliber | null;
    return param ?? null;
  });
  const [activeTab, setActiveTab] = useState<TradeTab>(() => {
    const tab = searchParams.get("tab") as TradeTab | null;
    if (tab === "mint" || tab === "redeem" || tab === "swap") return tab;
    return "mint";
  });

  function handleSelectCaliber(cal: Caliber) {
    setSelectedCaliber(cal);
    // Sync to URL so MintFlow/RedeemFlow can pick up via useSearchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set("caliber", cal.toLowerCase());
    router.replace(`/trade?${params.toString()}`);
  }

  function handleTabChange(tab: TradeTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (selectedCaliber) {
      params.set("caliber", selectedCaliber.toLowerCase());
    }
    router.replace(`/trade?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          Trade
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Select an action and caliber below
        </p>
      </div>

      <TradeTabs
        selectedCaliber={selectedCaliber}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        marketData={marketData}
        onSelectCaliber={handleSelectCaliber}
        tokenBalances={tokenBalances}
        isConnected={isConnected}
      />
    </div>
  );
}
