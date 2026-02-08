"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TimeRangeSelector, type TimeRange } from "./time-range-selector";
import type { CaliberId } from "@/lib/mock-data";
import { chartDataByCaliber } from "@/lib/mock-data";

interface PriceChartProps {
  caliberId: CaliberId;
}

interface ChartPayload {
  date: string;
  price: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPayload }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]!.payload;
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        border: "1px solid var(--border-hover)",
      }}
    >
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {data.date}
      </p>
      <p
        className="font-mono text-sm font-semibold tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        ${data.price.toFixed(3)}
      </p>
    </div>
  );
}

export function PriceChart({ caliberId }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const fullData = chartDataByCaliber[caliberId] ?? [];

  // Slice data based on time range
  const data = (() => {
    switch (timeRange) {
      case "24H":
        return fullData.slice(-1);
      case "7D":
        return fullData.slice(-7);
      case "30D":
        return fullData;
      case "90D":
        return fullData;
      case "1Y":
        return fullData;
      case "ALL":
        return fullData;
      default:
        return fullData;
    }
  })();

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.15 || 0.01;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--text-secondary)" }}
        >
          Price History
        </h2>
        <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
      </div>
      <div className="h-[300px] w-full lg:h-[400px]" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="brassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6A44E" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#C6A44E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 11,
                fontFamily: "var(--font-jetbrains)",
              }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 11,
                fontFamily: "var(--font-jetbrains)",
              }}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              width={54}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--border-hover)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#C6A44E"
              strokeWidth={2}
              fill="url(#brassGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#C6A44E",
                stroke: "var(--bg-primary)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
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
