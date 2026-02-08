"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { CaliberDetailData, CaliberId } from "@/lib/mock-data";
import { caliberIcons } from "./caliber-icons";

interface CaliberHeaderProps {
  data: CaliberDetailData;
}

export function CaliberHeader({ data }: CaliberHeaderProps) {
  const IconComponent = caliberIcons[data.id as CaliberId];
  const isPositive = data.change24h >= 0;

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="mb-4 flex items-center gap-2 text-sm"
        aria-label="Breadcrumb"
      >
        <a
          href="/market"
          className="transition-colors duration-150"
          style={{ color: "var(--brass)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--brass)";
          }}
        >
          Market
        </a>
        <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
          /
        </span>
        <span style={{ color: "var(--text-secondary)" }}>{data.symbol}</span>
      </nav>

      {/* Caliber name + icon */}
      <div className="flex items-center gap-3">
        <IconComponent size={32} />
        <div>
          <h1
            className="text-2xl font-bold tracking-tight lg:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {data.name}
          </h1>
          <p
            className="mt-0.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.specLine}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mt-5">
        <span
          className="font-mono text-5xl font-bold tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          ${data.price.toFixed(2)}
        </span>
        <div className="mt-2 flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
          >
            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(data.change24h).toFixed(1)}% ({isPositive ? "+" : "-"}$
            {Math.abs(data.change24hUsd).toFixed(3)})
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            24h
          </span>
        </div>
        <div
          className="mt-2 flex items-center gap-2 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          <span>
            24h High:{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              ${data.high24h.toFixed(3)}
            </span>
          </span>
          <span aria-hidden="true">|</span>
          <span>
            24h Low:{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              ${data.low24h.toFixed(3)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
