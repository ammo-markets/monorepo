"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMarketData } from "@/hooks/use-market-data";
import { buildTokens } from "./swap-types";
import { SwapTab } from "./swap-tab";
import { LendBorrowTab } from "./lend-borrow-tab";

/* ── Widget Inner Content ── */

export function SwapWidgetContent({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"swap" | "lend">("swap");
  const { data: marketCalibers = [] } = useMarketData();
  const tokens = buildTokens(marketCalibers);

  return (
    <div
      className="flex w-full flex-col rounded-2xl"
      style={{
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-hover)",
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Trade
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 text-text-secondary hover:bg-ax-tertiary hover:text-text-primary"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex px-5 pt-4 gap-1"
        role="tablist"
        aria-label="Trade type"
      >
        {(["swap", "lend"] as const).map((t) => {
          const isActive = tab === t;
          const label = t === "swap" ? "Swap" : "Lend & Borrow";
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brass-muted text-brass border border-brass-border"
                  : "bg-transparent text-text-muted border border-transparent hover:text-text-secondary hover:bg-ax-tertiary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4">
        {tab === "swap" ? <SwapTab tokens={tokens} /> : <LendBorrowTab />}
      </div>
    </div>
  );
}
