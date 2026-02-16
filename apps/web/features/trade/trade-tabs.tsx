"use client";

import { Suspense } from "react";
import { Plus, ArrowDownToLine, ArrowDownUp } from "lucide-react";
import { MintFlow } from "@/features/mint";
import { RedeemFlow } from "@/features/redeem";
import { SwapWidget } from "@/features/trade/swap-widget";
import type { Caliber } from "@ammo-exchange/shared";

type TradeTab = "mint" | "redeem" | "swap";

interface TradeTabsProps {
  selectedCaliber: Caliber | null;
  activeTab: TradeTab;
  onTabChange: (tab: TradeTab) => void;
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
}: TradeTabsProps) {
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

      {/* Tab content */}
      <div>
        {activeTab === "mint" && (
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
            <MintFlow />
          </Suspense>
        )}

        {activeTab === "redeem" && (
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
            <RedeemFlow />
          </Suspense>
        )}

        {activeTab === "swap" && (
          <div className="flex justify-center">
            <SwapWidget defaultOpen />
          </div>
        )}
      </div>
    </div>
  );
}
