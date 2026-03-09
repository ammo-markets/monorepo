"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TimeRangeSelector,
  type TimeRange,
  PriceChart,
  ProofOfReserves,
  CaliberSidebar,
  CaliberPillNav,
} from "@/features/market";
import { useMarketData } from "@/hooks/use-market-data";
import { usePriceHistory } from "@/hooks/use-price-history";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { Caliber } from "@ammo-exchange/shared";

export default function MarketPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(null);

  const { data: calibers = [], isLoading: calibersLoading } = useMarketData();

  // Auto-select first caliber once data loads
  useEffect(() => {
    if (calibers.length > 0 && !selectedCaliber) {
      setSelectedCaliber(calibers[0]!.caliber as Caliber);
    }
  }, [calibers, selectedCaliber]);

  const selectedData = calibers.find((c) => c.caliber === selectedCaliber);

  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(
    selectedCaliber,
    timeRange,
  );

  const SelectedIcon = selectedCaliber
    ? caliberIcons[selectedCaliber]
    : null;

  return (
    <div className="px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight lg:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Market
          </h1>
          <p
            className="mt-1 text-sm lg:text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Real-time pricing for all tokenized calibers
          </p>
        </div>

        {/* Mobile: pill nav */}
        <div className="mb-4 lg:hidden">
          <CaliberPillNav
            calibers={calibers}
            selectedCaliber={selectedCaliber}
            onSelect={setSelectedCaliber}
            isLoading={calibersLoading}
          />
        </div>

        {/* Main layout: 30/70 split */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:w-[30%]">
            <div className="sticky top-24">
              <CaliberSidebar
                calibers={calibers}
                selectedCaliber={selectedCaliber}
                onSelect={setSelectedCaliber}
                isLoading={calibersLoading}
              />
            </div>
          </div>

          {/* Main stage */}
          <div className="min-w-0 flex-1">
            {/* Chart card */}
            {selectedCaliber && (
              <div
                className="rounded-2xl p-5 lg:p-6"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {/* Caliber name + price */}
                {SelectedIcon && selectedData && (
                  <div className="mb-4 flex items-center gap-3">
                    <SelectedIcon size={28} />
                    <div>
                      <span
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedData.name}
                      </span>
                    </div>
                    <span
                      className="ml-auto font-mono text-xl font-bold tabular-nums"
                      style={{ color: "var(--brass)" }}
                    >
                      ${selectedData.pricePerRound.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Time range selector + Mint button */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <TimeRangeSelector
                    selected={timeRange}
                    onSelect={setTimeRange}
                  />
                  <Link
                    href={`/exchange?caliber=${selectedCaliber.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 hover:opacity-80"
                    style={{
                      color: "var(--brass)",
                      border: "1px solid var(--brass)",
                    }}
                  >
                    Mint
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                {/* Chart */}
                <PriceChart
                  caliberId={selectedCaliber}
                  currentPrice={selectedData?.pricePerRound}
                  data={priceHistory}
                  isLoading={historyLoading}
                  timeRange={timeRange}
                  embedded
                />
              </div>
            )}

            {/* Loading state for chart card */}
            {!selectedCaliber && calibersLoading && (
              <div
                className="h-[500px] rounded-2xl shimmer"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              />
            )}

          </div>
        </div>

        {/* Proof of Reserves — full width below the 30/70 split */}
        <div className="mt-6">
          <ProofOfReserves />
        </div>
      </div>
    </div>
  );
}
