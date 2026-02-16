"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMarketData } from "@/hooks/use-market-data";
import { CaliberInfoPanel, TradeTabs } from "@/features/trade";
import type { Caliber } from "@ammo-exchange/shared";

type TradeTab = "mint" | "redeem" | "swap";

export function TradePageClient() {
  const { data: marketData = [] } = useMarketData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(
    () => {
      const param = searchParams.get("caliber")?.toUpperCase() as Caliber | null;
      return param ?? null;
    },
  );
  const [activeTab, setActiveTab] = useState<TradeTab>("mint");

  function handleSelectCaliber(cal: Caliber) {
    setSelectedCaliber(cal);
    // Sync to URL so MintFlow/RedeemFlow can pick up via useSearchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set("caliber", cal.toLowerCase());
    router.replace(`/trade?${params.toString()}`);
  }

  function handleTabChange(tab: TradeTab) {
    setActiveTab(tab);
    // Sync caliber to URL when switching tabs so flows can pre-select
    if (selectedCaliber) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("caliber", selectedCaliber.toLowerCase());
      router.replace(`/trade?${params.toString()}`);
    }
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
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Select a caliber and choose your action below
        </p>
      </div>

      <div className="mb-8">
        <CaliberInfoPanel
          selectedCaliber={selectedCaliber}
          onSelectCaliber={handleSelectCaliber}
          marketData={marketData}
        />
      </div>

      <TradeTabs
        selectedCaliber={selectedCaliber}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
