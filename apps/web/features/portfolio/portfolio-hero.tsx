"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Label } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { ChartConfig } from "@/components/ui/chart";
import type { HoldingRow } from "./holdings-row";
import type { Caliber } from "@ammo-exchange/shared";

/* ────────────── Colors ────────────── */

const CALIBER_COLORS: Record<Caliber, string> = {
  "9MM_PRACTICE": "#D4956A",
  "9MM_SELF_DEFENSE": "#C47A50",
  "556_SELF_DEFENSE": "#6B8E4E",
  "556_NATO_PRACTICE": "#5B8FAD",
};

/* ────────────── Types ────────────── */

interface PortfolioHeroProps {
  holdings: HoldingRow[];
  totalValue: number;
  usdcBalance: number;
  onViewOrdersForCaliber: (caliber: Caliber) => void;
}

interface ChartEntry {
  caliber: Caliber;
  value: number;
  fill: string;
}

/* ────────────── Main Component ────────────── */

export function PortfolioHero({
  holdings,
  totalValue,
  usdcBalance,
  onViewOrdersForCaliber,
}: PortfolioHeroProps) {
  const chartData: ChartEntry[] = useMemo(
    () =>
      holdings.map((h) => ({
        caliber: h.caliber,
        value: h.value,
        fill: CALIBER_COLORS[h.caliber],
      })),
    [holdings],
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    for (const h of holdings) {
      cfg[h.caliber] = {
        label: h.caliber,
        color: CALIBER_COLORS[h.caliber],
      };
    }
    return cfg;
  }, [holdings]);

  return (
    <div>
      <h1
        className="mb-6 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Portfolio
      </h1>

      {/* Unified grid: summary card + caliber cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Summary card */}
        <div
          className="flex flex-col items-center justify-center rounded-xl p-4 sm:aspect-square"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[160px]"
          >
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const entry = payload[0]?.payload as ChartEntry;
                  const pct =
                    totalValue > 0
                      ? ((entry.value / totalValue) * 100).toFixed(1)
                      : "0";
                  return (
                    <div
                      className="rounded-lg px-3 py-2 text-xs shadow-lg"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: entry.fill }}
                        />
                        <span className="font-medium">{entry.caliber}</span>
                      </div>
                      <div
                        className="mt-1 font-mono tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        ${entry.value.toFixed(2)} ({pct}%)
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="caliber"
                innerRadius={50}
                outerRadius={72}
                strokeWidth={2}
                stroke="var(--bg-primary)"
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.caliber} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 8}
                            className="fill-text-primary text-lg font-bold"
                          >
                            ${totalValue.toFixed(2)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 10}
                            className="fill-text-muted text-[10px]"
                          >
                            {holdings.length} caliber
                            {holdings.length !== 1 ? "s" : ""}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {usdcBalance > 0 && (
            <p
              className="mt-1 text-center text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              + ${usdcBalance.toFixed(2)} USDT available
            </p>
          )}
        </div>

        {/* Caliber cards */}
        {holdings.map((h) => (
          <CaliberCard
            key={h.caliber}
            holding={h}
            totalValue={totalValue}
            onViewOrders={() => onViewOrdersForCaliber(h.caliber)}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────────── Caliber Card ────────────── */

function CaliberCard({
  holding,
  totalValue,
  onViewOrders,
}: {
  holding: HoldingRow;
  totalValue: number;
  onViewOrders: () => void;
}) {
  const Icon = caliberIcons[holding.caliber];
  const router = useRouter();
  const pct =
    totalValue > 0 ? ((holding.value / totalValue) * 100).toFixed(0) : "0";

  return (
    <div
      className="group cursor-pointer rounded-xl p-4 transition-colors duration-150 hover:border-brass-border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      role="link"
      tabIndex={0}
      onClick={() =>
        router.push(`/exchange?caliber=${holding.caliber.toLowerCase()}`)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/exchange?caliber=${holding.caliber.toLowerCase()}`);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {holding.symbol}
        </span>
        <span
          className="ml-auto font-mono text-xs tabular-nums"
          style={{ color: CALIBER_COLORS[holding.caliber] }}
        >
          {pct}%
        </span>
      </div>

      {/* Stats */}
      <div className="mt-3 space-y-1">
        <p
          className="font-mono text-xs tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {holding.balance.toLocaleString()} rounds
        </p>
        <p
          className="font-mono text-base font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${holding.value.toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div
        className="mt-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/exchange?tab=mint&caliber=${holding.caliber.toLowerCase()}`}
          className="flex-1 rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-colors duration-150 bg-brass text-ax-primary hover:bg-brass-hover"
        >
          Mint
        </Link>
        <Link
          href={`/exchange?tab=redeem&caliber=${holding.caliber.toLowerCase()}`}
          className="flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium transition-colors duration-150"
          style={{
            border: "1px solid var(--border-hover)",
            color: "var(--text-secondary)",
          }}
        >
          Redeem
        </Link>
      </div>

      {/* Orders link */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewOrders();
        }}
        className="mt-2 w-full text-center text-[11px] font-medium transition-colors duration-150"
        style={{ color: "var(--text-muted)" }}
      >
        Orders &darr;
      </button>
    </div>
  );
}
