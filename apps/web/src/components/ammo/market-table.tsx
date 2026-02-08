"use client";

import React from "react";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { type MarketCaliberData, marketCalibers } from "@/lib/mock-data";
import { caliberIcons } from "./caliber-icons";

type SortKey =
  | "price"
  | "change24h"
  | "change7d"
  | "volume24h"
  | "totalSupply"
  | "warehouseBacking";
type SortDir = "asc" | "desc";

function parseVolume(v: string): number {
  const num = Number.parseFloat(v.replace(/[$,K]/g, ""));
  return v.includes("K") ? num * 1000 : num;
}

function formatRounds(n: number): string {
  return n.toLocaleString("en-US") + " rounds";
}

function ChangeCell({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 font-mono text-sm tabular-nums"
      style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
    >
      {isPositive ? (
        <ArrowUp size={12} aria-label="Up" />
      ) : (
        <ArrowDown size={12} aria-label="Down" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey | null;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
      onClick={() => onSort(sortKey)}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
      }}
      aria-sort={
        isActive ? (currentDir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <span
        className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}
      >
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </span>
    </th>
  );
}

/* ────────────── Skeleton ────────────── */

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-4">
        <div className="h-4 w-6 rounded shimmer" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded shimmer" />
          <div className="h-4 w-28 rounded shimmer" />
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-14 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-14 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-14 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-16 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-24 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-24 rounded shimmer" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-24 rounded shimmer" />
      </td>
    </tr>
  );
}

function CardSkeleton() {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded shimmer" />
        <div className="h-5 w-28 rounded shimmer" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 rounded shimmer mb-1" />
            <div className="h-4 w-20 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── Mobile Card ────────────── */

function MobileCaliberCard({
  caliber,
  index,
}: {
  caliber: MarketCaliberData;
  index: number;
}) {
  const router = useRouter();
  const IconComponent = caliberIcons[caliber.id];

  return (
    <div
      className="cursor-pointer rounded-xl p-4 transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      onClick={() => router.push(`/market/${caliber.id.toLowerCase()}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brass-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/market/${caliber.id.toLowerCase()}`);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-5 w-5 items-center justify-center text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {index + 1}
          </span>
          <IconComponent size={24} />
          <div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {caliber.symbol}
            </span>
            <span
              className="ml-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {caliber.name}
            </span>
          </div>
        </div>
        <span
          className="font-mono text-lg font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${caliber.price.toFixed(2)}
        </span>
      </div>

      {/* Data grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DataItem
          label="24h Change"
          value={<ChangeCell value={caliber.change24h} />}
        />
        <DataItem
          label="7d Change"
          value={<ChangeCell value={caliber.change7d} />}
        />
        <DataItem
          label="24h Volume"
          value={
            <span
              className="font-mono text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {caliber.volume24h}
            </span>
          }
        />
        <DataItem
          label="Total Supply"
          value={
            <span
              className="font-mono text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {(caliber.totalSupply / 1000).toFixed(0)}K
            </span>
          }
        />
        <DataItem
          label="Warehouse"
          value={
            <span
              className="flex items-center gap-1 font-mono text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {(caliber.warehouseBacking / 1000).toFixed(0)}K
              {caliber.fullyBacked && (
                <CheckCircle2 size={12} style={{ color: "var(--green)" }} />
              )}
            </span>
          }
        />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Mint
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--border-hover)",
            color: "var(--text-secondary)",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Trade
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span
        className="text-[11px] uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

/* ────────────── Main Table ────────────── */

export function MarketTable() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isLoading] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return marketCalibers;
    return [...marketCalibers].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      if (sortKey === "volume24h") {
        aVal = parseVolume(a.volume24h);
        bVal = parseVolume(b.volume24h);
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [sortKey, sortDir]);

  const router = useRouter();

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div
          className="hidden overflow-hidden rounded-xl md:block"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <table className="w-full">
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile skeleton */}
        <div className="flex flex-col gap-3 md:hidden">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div
        className="hidden overflow-hidden rounded-xl md:block"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted)", width: "48px" }}
                >
                  #
                </th>
                <th
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Caliber
                </th>
                <SortHeader
                  label="Price/Round"
                  sortKey="price"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="24h"
                  sortKey="change24h"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="7d"
                  sortKey="change7d"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="24h Volume"
                  sortKey="volume24h"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="Total Supply"
                  sortKey="totalSupply"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="Warehouse"
                  sortKey="warehouseBacking"
                  currentSort={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="right"
                />
                <th
                  className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--text-muted)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((caliber, index) => {
                const IconComponent = caliberIcons[caliber.id];
                return (
                  <tr
                    key={caliber.id}
                    className="cursor-pointer transition-colors duration-100"
                    style={{
                      borderBottom:
                        index < sorted.length - 1
                          ? "1px solid var(--border-default)"
                          : "none",
                    }}
                    onClick={() =>
                      router.push(`/market/${caliber.id.toLowerCase()}`)
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* # */}
                    <td className="px-4 py-4">
                      <span
                        className="font-mono text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {index + 1}
                      </span>
                    </td>

                    {/* Caliber */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <IconComponent size={20} />
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {caliber.symbol}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {caliber.name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className="font-mono text-sm font-medium tabular-nums"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ${caliber.price.toFixed(2)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="px-4 py-4 text-right">
                      <ChangeCell value={caliber.change24h} />
                    </td>

                    {/* 7d Change */}
                    <td className="px-4 py-4 text-right">
                      <ChangeCell value={caliber.change7d} />
                    </td>

                    {/* Volume */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className="font-mono text-sm tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {caliber.volume24h}
                      </span>
                    </td>

                    {/* Total Supply */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className="font-mono text-sm tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatRounds(caliber.totalSupply)}
                      </span>
                    </td>

                    {/* Warehouse Backing */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatRounds(caliber.warehouseBacking)}
                        {caliber.fullyBacked && (
                          <CheckCircle2
                            size={14}
                            style={{ color: "var(--green)" }}
                            aria-label="Fully backed"
                          />
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
                          style={{
                            backgroundColor: "var(--brass)",
                            color: "var(--bg-primary)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--brass-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--brass)";
                          }}
                        >
                          Mint
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid var(--border-hover)",
                            color: "var(--text-secondary)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bg-tertiary)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--text-secondary)";
                          }}
                        >
                          Trade
                          <ExternalLink size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {sorted.map((caliber, index) => (
          <MobileCaliberCard key={caliber.id} caliber={caliber} index={index} />
        ))}
      </div>
    </>
  );
}
