import type { ReactNode } from "react";
import type { CaliberDetailData } from "@/lib/types";

interface TokenStatsProps {
  data: CaliberDetailData;
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: ReactNode;
  suffix?: ReactNode;
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
          value={`${Number(data.totalSupply).toLocaleString("en-US")} rounds`}
        />
        <StatCard
          label="Market Cap"
          value={`$${(Number(data.totalSupply) * data.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
        />
        <StatCard label="Mint Fee" value={`${data.mintFee}%`} />
        <StatCard label="Redeem Fee" value={`${data.redeemFee}%`} />
      </div>
    </div>
  );
}

export function TokenStatsSkeleton() {
  return (
    <div>
      <div className="mb-4 h-4 w-24 rounded shimmer" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
