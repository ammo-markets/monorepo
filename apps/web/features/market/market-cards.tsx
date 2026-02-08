"use client";

import React from "react";

import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { calibers } from "@/lib/mock-data";
import { caliberIcons } from "@/features/shared/caliber-icons";

function SectionTitle({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-12 text-center lg:mb-16" id={id}>
      <h2
        className="text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </h2>
      <div
        className="mx-auto mt-3 h-px w-12"
        style={{ backgroundColor: "var(--brass)" }}
        aria-hidden="true"
      />
    </div>
  );
}

function CaliberCard({ caliber }: { caliber: (typeof calibers)[number] }) {
  const IconComponent = caliberIcons[caliber.id];
  const isPositive = caliber.change24h >= 0;
  const chartData = caliber.sparklineData.map((value, i) => ({ i, value }));
  const chartColor = isPositive ? "var(--green)" : "var(--red)";

  return (
    <a
      href={`/market/${caliber.id.toLowerCase()}`}
      className="group block rounded-xl p-5 transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brass-border)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.2), 0 0 20px rgba(198,164,78,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconComponent size={32} />
        <div>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {caliber.symbol}
          </span>
          <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {caliber.name}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="font-mono text-2xl font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${caliber.price.toFixed(2)}
        </span>
        <span
          className="flex items-center gap-0.5 text-xs font-medium tabular-nums"
          style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
        >
          {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(caliber.change24h).toFixed(1)}%
        </span>
      </div>

      {/* Sparkline */}
      <div className="mt-4 h-[60px] w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={60} minWidth={0}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id={`fill-${caliber.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={1.5}
              fill={`url(#fill-${caliber.id})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          24h Vol: {caliber.volume24h}
        </span>
        <span
          className="flex items-center gap-1 text-xs font-medium transition-colors duration-150"
          style={{ color: "var(--text-secondary)" }}
        >
          Mint
          <ArrowRight
            size={12}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}

function CaliberCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded shimmer" />
        <div className="h-4 w-24 rounded shimmer" />
      </div>
      <div className="mt-4 h-7 w-20 rounded shimmer" />
      <div className="mt-4 h-[60px] w-full rounded shimmer" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-3 w-12 rounded shimmer" />
      </div>
    </div>
  );
}

export function MarketCards() {
  return (
    <section
      id="market"
      className="py-24 px-4 lg:py-32"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionTitle>Live Market</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calibers.map((caliber) => (
            <CaliberCard key={caliber.id} caliber={caliber} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketCardsSkeleton() {
  return (
    <section
      className="py-24 px-4 lg:py-32"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionTitle>Live Market</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CaliberCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
