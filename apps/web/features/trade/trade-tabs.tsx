"use client";

import { Suspense, useState } from "react";
import { Plus, ArrowDownToLine } from "lucide-react";
import { MintFlow } from "@/features/mint";
import { RedeemFlow } from "@/features/redeem";
import { ErrorBoundary } from "@/components/error-boundary";

import { CaliberInfoPanel } from "@/features/trade/caliber-info-panel";
import { ComingSoonPreview } from "@/features/trade/coming-soon-preview";
import type { Caliber, UpcomingCaliberSpec } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";

type TradeTab = "mint" | "redeem";

interface TokenBalances {
  usdc: bigint | undefined;
  tokens: Record<Caliber, bigint | undefined>;
  isLoading: boolean;
}

interface TradeTabsProps {
  selectedCaliber: Caliber | null;
  activeTab: TradeTab;
  onTabChange: (tab: TradeTab) => void;
  marketData: MarketCaliberFromAPI[];
  onSelectCaliber: (cal: Caliber) => void;
  tokenBalances: TokenBalances;
  isConnected: boolean;
}

const TABS: { id: TradeTab; label: string; icon: typeof Plus }[] = [
  { id: "mint", label: "Mint", icon: Plus },
  { id: "redeem", label: "Redeem", icon: ArrowDownToLine },
];

export function TradeTabs({
  selectedCaliber,
  activeTab,
  onTabChange,
  marketData,
  onSelectCaliber,
  tokenBalances,
  isConnected,
}: TradeTabsProps) {
  const [selectedUpcoming, setSelectedUpcoming] =
    useState<UpcomingCaliberSpec | null>(null);

  const handleSelectCaliber = (cal: Caliber) => {
    setSelectedUpcoming(null);
    onSelectCaliber(cal);
  };

  const handleSelectUpcoming = (spec: UpcomingCaliberSpec) => {
    setSelectedUpcoming(spec);
  };

  const handleBackToLive = (cal: Caliber) => {
    setSelectedUpcoming(null);
    onSelectCaliber(cal);
  };

  return (
    <div>
      {/* Tab buttons */}
      <div
        className="mb-6 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Trade options"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brass-muted text-brass border border-brass-border"
                  : "bg-transparent text-text-muted border border-transparent hover:bg-ax-tertiary hover:text-text-secondary"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Caliber selection */}
      <div className="mb-6">
        <CaliberInfoPanel
          selectedCaliber={selectedUpcoming ? null : selectedCaliber}
          onSelectCaliber={handleSelectCaliber}
          marketData={marketData}
          balances={tokenBalances}
          mode={activeTab}
          isConnected={isConnected}
          selectedUpcomingId={selectedUpcoming?.id ?? null}
          onSelectUpcoming={handleSelectUpcoming}
        />
      </div>

      {/* Tab content */}
      <div>
        {selectedUpcoming ? (
          <ComingSoonPreview
            upcoming={selectedUpcoming}
            currentLiveCaliber={selectedCaliber}
            onBackToLive={handleBackToLive}
          />
        ) : activeTab === "mint" ? (
          selectedCaliber ? (
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div
                    className="py-12 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Loading...
                  </div>
                }
              >
                <MintFlow
                  key={selectedCaliber}
                  selectedCaliber={selectedCaliber!}
                />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Select a caliber above to start minting
            </div>
          )
        ) : selectedCaliber ? (
          <ErrorBoundary>
            <Suspense
              fallback={
                <div
                  className="py-12 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Loading...
                </div>
              }
            >
              <RedeemFlow
                key={selectedCaliber}
                selectedCaliber={selectedCaliber!}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div
            className="py-12 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Select a caliber above to start redeeming
          </div>
        )}
      </div>
    </div>
  );
}
