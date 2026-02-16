"use client";

import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown, ExternalLink } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { useMarketData } from "@/hooks/use-market-data";
import type { MarketCaliberFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";

type SortKey = "price" | "totalSupply";
type SortDir = "asc" | "desc";

function formatRounds(n: number): string {
  return n.toLocaleString("en-US") + " rounds";
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
      } ${isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
      onClick={() => onSort(sortKey)}
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

/* Skeleton */

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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 rounded shimmer mb-1" />
            <div className="h-4 w-20 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Mobile Card */

function MobileCaliberCard({
  caliber,
  index,
}: {
  caliber: MarketCaliberFromAPI;
  index: number;
}) {
  const router = useRouter();
  const IconComponent = caliberIcons[caliber.caliber as Caliber];

  return (
    <div
      className="cursor-pointer rounded-xl border border-border-default bg-ax-secondary p-4 transition-all duration-150 hover:border-brass-border"
      onClick={() => router.push(`/market/${caliber.caliber.toLowerCase()}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/market/${caliber.caliber.toLowerCase()}`);
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
              {caliber.caliber}
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
          ${caliber.pricePerRound.toFixed(2)}
        </span>
      </div>

      {/* Data grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DataItem
          label="Total Supply"
          value={
            <span
              className="font-mono text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {caliber.totalSupply > 0
                ? (caliber.totalSupply / 1000).toFixed(0) + "K"
                : "--"}
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

function DataItem({ label, value }: { label: string; value: ReactNode }) {
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

/* Main Table */

export function MarketTable() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { data: calibers = [], isLoading } = useMarketData();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return calibers;
    return [...calibers].sort((a, b) => {
      let aVal: number;
      let bVal: number;
      if (sortKey === "price") {
        aVal = a.pricePerRound;
        bVal = b.pricePerRound;
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [sortKey, sortDir, calibers]);

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
          <table className="w-full min-w-[600px]">
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
                  label="Total Supply"
                  sortKey="totalSupply"
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
                const IconComponent = caliberIcons[caliber.caliber as Caliber];
                return (
                  <tr
                    key={caliber.caliber}
                    className="cursor-pointer transition-colors duration-100 hover:bg-ax-tertiary"
                    style={{
                      borderBottom:
                        index < sorted.length - 1
                          ? "1px solid var(--border-default)"
                          : "none",
                    }}
                    onClick={() =>
                      router.push(`/market/${caliber.caliber.toLowerCase()}`)
                    }
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
                          {caliber.caliber}
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
                        ${caliber.pricePerRound.toFixed(2)}
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

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-brass px-3 py-1.5 text-xs font-semibold text-ax-primary transition-colors duration-150 hover:bg-brass-hover"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Mint
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-md border border-border-hover bg-transparent px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:bg-ax-tertiary hover:text-text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
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
          <MobileCaliberCard
            key={caliber.caliber}
            caliber={caliber}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
