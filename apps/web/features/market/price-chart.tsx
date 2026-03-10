"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Caliber } from "@ammo-exchange/shared";
import type { PricePoint } from "@/hooks/use-price-history";
import type { TimeRange } from "./time-range-selector";

interface PriceChartProps {
  caliberId: Caliber;
  currentPrice?: number;
  data?: PricePoint[];
  isLoading?: boolean;
  timeRange?: TimeRange;
  embedded?: boolean;
}

function formatXAxis(timestamp: string, timeRange: TimeRange): string {
  const date = new Date(timestamp);
  if (timeRange === "24H") {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (timeRange === "7D" || timeRange === "30D") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { timestamp: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!;
  const date = new Date(point.payload.timestamp);

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="font-mono font-semibold" style={{ color: "var(--brass)" }}>
        ${point.value.toFixed(4)}
      </div>
      <div style={{ color: "var(--text-muted)" }}>
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        {date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

export function PriceChart({
  caliberId,
  currentPrice,
  data,
  isLoading,
  timeRange = "90D",
  embedded = false,
}: PriceChartProps) {
  const hasData = data && data.length > 0;

  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.1 || 0.01;
    return [min - pad, max + pad] as [number, number];
  }, [data]);

  const chartContent = (
    <div
      className={`flex w-full flex-col ${embedded ? "h-[300px] lg:h-[400px]" : "h-[300px] rounded-xl lg:h-[400px]"}`}
      style={
        embedded
          ? undefined
          : {
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }
      }
    >
        {isLoading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
              style={{ color: "var(--brass)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Loading chart…
            </span>
          </div>
        ) : !hasData ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            {currentPrice !== undefined && currentPrice > 0 && (
              <span
                className="mb-3 font-mono text-3xl font-bold tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                ${currentPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              No price history yet
            </span>
            <span
              className="mt-1 text-xs"
              style={{ color: "var(--text-muted)", opacity: 0.6 }}
            >
              Current oracle price for {caliberId}
            </span>
          </div>
        ) : (
          <div className="h-full w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brass)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brass)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatXAxis(ts, timeRange)}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={yDomain}
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--brass)"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--brass)",
                    stroke: "var(--bg-primary)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );

  if (embedded) return chartContent;

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
      {chartContent}
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
