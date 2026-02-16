"use client";

import { Suspense } from "react";
import { Plus, ArrowDownToLine, ArrowDownUp } from "lucide-react";
import { MintFlow } from "@/features/mint";
import { RedeemFlow } from "@/features/redeem";

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
  isConnected: boolean;
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
  isConnected,
}: TradeTabsProps) {
  const showCaliberPanel = activeTab === "mint" || activeTab === "redeem";
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
              {tab.id === "swap" && (
                <span
                  className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(243, 156, 18, 0.15)",
                    color: "var(--amber)",
                  }}
                >
                  Soon
                </span>
              )}
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
            isConnected={isConnected}
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(243, 156, 18, 0.1)",
                border: "1.5px solid var(--amber)",
              }}
            >
              <ArrowDownUp size={24} style={{ color: "var(--amber)" }} />
            </div>
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Swap Coming Soon
            </h3>
            <p
              className="max-w-sm text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Trade ammo tokens directly with other users via decentralized
              exchange pools. Swap between calibers or convert to USDC without
              the 24-48h settlement window.
            </p>
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              Powered by Uniswap V3 on Avalanche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
