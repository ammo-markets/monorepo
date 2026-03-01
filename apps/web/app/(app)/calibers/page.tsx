"use client";

import { useState } from "react";
import {
  MarketTable,
  TimeRangeSelector,
  type TimeRange,
  ProofOfReserves,
} from "@/features/market";

export default function MarketPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");

  return (
    <div className="px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
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
          <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
        </div>

        {/* Table */}
        <MarketTable />

        {/* Proof of Reserves banner */}
        <div className="mt-6">
          <ProofOfReserves />
        </div>
      </div>
    </div>
  );
}
