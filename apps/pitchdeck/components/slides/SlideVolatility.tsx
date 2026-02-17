"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SlideLayout } from "../SlideLayout";
import { PRICE_DATA } from "@/lib/slideData";

export function SlideVolatility() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">
        9mm Price Volatility
      </h2>
      <p className="mb-8 text-lg text-text-muted">
        9mm FMJ price per round, 2018 - 2025
      </p>

      <div className="flex-1">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PRICE_DATA}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c6a44e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c6a44e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a25" />
              <XAxis
                dataKey="year"
                stroke="#8a8a9a"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#8a8a9a"
                fontSize={12}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                tickLine={false}
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#12121a",
                  border: "1px solid #1a1a25",
                  borderRadius: "8px",
                  color: "#e8e8ed",
                }}
                formatter={(value: number) => [
                  `$${value.toFixed(2)}/rd`,
                  "9mm FMJ",
                ]}
              />
              <ReferenceLine
                y={0.82}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                label={{
                  value: "355% increase",
                  position: "right",
                  fill: "#e74c3c",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#c6a44e"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-text-muted">
        Source: Aggregated retail price data (ammoseek.com historical averages)
      </p>
    </SlideLayout>
  );
}
