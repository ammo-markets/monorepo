import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { CaliberDetailData } from "@/lib/mock-data";

interface TokenStatsProps {
  data: CaliberDetailData;
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className="font-mono text-sm font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </span>
        {suffix}
      </div>
    </div>
  );
}

export function TokenStats({ data }: TokenStatsProps) {
  const matched = data.totalSupply === data.warehouseInventory;

  return (
    <div>
      <h2
        className="mb-4 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        Token Stats
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Total Supply"
          value={`${data.totalSupply.toLocaleString("en-US")} rounds`}
        />
        <StatCard
          label="Warehouse Inventory"
          value={`${data.warehouseInventory.toLocaleString("en-US")} rounds`}
          suffix={
            matched ? (
              <CheckCircle2
                size={14}
                style={{ color: "var(--green)" }}
                aria-label="Matched"
              />
            ) : null
          }
        />
        <StatCard
          label="24h Volume"
          value={`$${data.volume24h.toLocaleString("en-US")}`}
        />
        <StatCard
          label="Market Cap"
          value={`$${data.marketCap.toLocaleString("en-US")}`}
        />
        <StatCard label="Mint Fee" value={`${data.mintFee}%`} />
        <StatCard label="Redeem Fee" value={`${data.redeemFee}%`} />
        <StatCard label="Min Mint" value={`${data.minMint} rounds`} />
      </div>
    </div>
  );
}

export function TokenStatsSkeleton() {
  return (
    <div>
      <div className="mb-4 h-4 w-24 rounded shimmer" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="h-3 w-20 rounded shimmer" />
            <div className="mt-2 h-4 w-28 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
