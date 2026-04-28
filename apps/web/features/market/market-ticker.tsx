"use client";

import { caliberIcons } from "@/features/shared/caliber-icons";
import { useMarketData } from "@/hooks/use-market-data";
import type { Caliber } from "@ammo-exchange/shared";

export function MarketTicker() {
  const { data: calibers = [], isLoading: loading } = useMarketData();

  if (loading) return <MarketTickerSkeleton />;

  return (
    <section
      className="w-full overflow-x-auto py-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-default)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-6 lg:gap-0 lg:justify-between lg:w-full">
          {calibers.map((caliber) => {
            const IconComponent = caliberIcons[caliber.caliber as Caliber];
            return (
              <div
                key={caliber.caliber}
                className="flex shrink-0 items-center gap-3 lg:flex-1 lg:justify-center"
              >
                <IconComponent size={24} />
                <div className="flex items-center gap-3">
                  <div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {caliber.caliber}
                      </span>
                      <span className="ml-1.5">{caliber.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="font-mono text-sm font-medium tabular-nums"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ${caliber.pricePerRound.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Divider -- hidden on last item and on mobile */}
                <div
                  className="ml-6 hidden h-8 w-px lg:block"
                  style={{ backgroundColor: "var(--border-default)" }}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Skeleton version for loading state */
export function MarketTickerSkeleton() {
  return (
    <section
      className="w-full py-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-default)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        {[1].map((i) => (
          <div
            key={i}
            className="flex flex-1 items-center gap-3 justify-center"
          >
            <div className="h-6 w-6 rounded shimmer" />
            <div>
              <div className="h-3 w-24 rounded shimmer" />
              <div className="mt-1.5 h-4 w-16 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
