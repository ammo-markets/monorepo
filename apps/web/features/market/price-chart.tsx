"use client";

import type { Caliber } from "@ammo-exchange/shared";

interface PriceChartProps {
  caliberId: Caliber;
  currentPrice?: number;
}

export function PriceChart({ caliberId, currentPrice }: PriceChartProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--text-secondary)" }}
        >
          Price History
        </h2>
      </div>
      <div
        className="flex h-[300px] w-full flex-col items-center justify-center rounded-xl lg:h-[400px]"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {currentPrice !== undefined && currentPrice > 0 && (
          <span
            className="mb-3 font-mono text-3xl font-bold tabular-nums"
            style={{ color: "var(--brass)" }}
          >
            ${currentPrice.toFixed(2)}
          </span>
        )}
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Historical price data coming soon
        </span>
        <span
          className="mt-1 text-xs"
          style={{ color: "var(--text-muted)", opacity: 0.6 }}
        >
          Current oracle price for {caliberId}
        </span>
      </div>
    </div>
  );
}

/* Chart skeleton for loading state */
export function PriceChartSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-24 rounded shimmer" />
        <div className="h-8 w-64 rounded shimmer" />
      </div>
      <div className="h-[300px] w-full rounded-lg lg:h-[400px] shimmer" />
    </div>
  );
}
