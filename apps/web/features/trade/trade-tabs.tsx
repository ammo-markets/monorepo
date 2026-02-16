"use client";

import { Suspense } from "react";
import { Plus, ArrowDownToLine, ArrowDownUp } from "lucide-react";
import { MintFlow } from "@/features/mint";
import { RedeemFlow } from "@/features/redeem";
import { SwapWidget } from "@/features/trade/swap-widget";
import { CaliberInfoPanel } from "@/features/trade/caliber-info-panel";
import type { Caliber } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";

type TradeTab = "mint" | "redeem" | "swap";

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
}

const TABS: { id: TradeTab; label: string; icon: typeof Plus }[] = [
  { id: "mint", label: "Mint", icon: Plus },
  { id: "redeem", label: "Redeem", icon: ArrowDownToLine },
  { id: "swap", label: "Swap", icon: ArrowDownUp },
];

export function TradeTabs({
  selectedCaliber,
  activeTab,
  onTabChange,
  marketData,
  onSelectCaliber,
  tokenBalances,
}: TradeTabsProps) {
  const showCaliberPanel = activeTab === "mint" || activeTab === "redeem";
  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive
                  ? "var(--brass-muted)"
                  : "transparent",
                color: isActive ? "var(--brass)" : "var(--text-muted)",
                border: isActive
                  ? "1px solid var(--brass-border)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Caliber selection (mint/redeem only) */}
      {showCaliberPanel && (
        <div className="mb-6">
          <CaliberInfoPanel
            selectedCaliber={selectedCaliber}
            onSelectCaliber={onSelectCaliber}
            marketData={marketData}
            balances={tokenBalances}
            mode={activeTab as "mint" | "redeem"}
          />
        </div>
      )}

      {/* Tab content */}
      <div>
        {activeTab === "mint" &&
          (selectedCaliber ? (
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
          ) : (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Select a caliber above to start minting
            </div>
          ))}

        {activeTab === "redeem" &&
          (selectedCaliber ? (
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
          ) : (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Select a caliber above to start redeeming
            </div>
          ))}

        {activeTab === "swap" && (
          <div className="flex justify-center">
            <SwapWidget defaultOpen />
          </div>
        )}
      </div>
    </div>
  );
}
