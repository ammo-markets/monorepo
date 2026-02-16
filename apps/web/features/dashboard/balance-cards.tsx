"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import type { Caliber } from "@ammo-exchange/shared";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";
import { caliberIcons } from "@/features/shared/caliber-icons";

/* ────────────── Constants ────────────── */

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];

/* ────────────── Props ────────────── */

interface BalanceCardsProps {
  balances: Record<Caliber, bigint | undefined>;
  usdc: bigint | undefined;
  marketData: MarketCaliberFromAPI[];
  isLoading: boolean;
}

/* ────────────── Helpers ────────────── */

function computeHoldings(
  balances: Record<Caliber, bigint | undefined>,
  marketData: MarketCaliberFromAPI[],
) {
  const priceMap = new Map(marketData.map((m) => [m.caliber, m.pricePerRound]));

  return CALIBERS.map((caliber) => {
    const raw = balances[caliber] ?? BigInt(0);
    const balance = Math.floor(Number(formatUnits(raw, 18)));
    const price = priceMap.get(caliber) ?? 0;
    const value = balance * price;
    return {
      caliber,
      symbol: caliber,
      name: CALIBER_SPECS[caliber].name,
      balance,
      price,
      value,
    };
  });
}

/* ────────────── Skeleton ────────────── */

function BalanceCardsSkeleton() {
  return (
    <div>
      {/* Portfolio value skeleton */}
      <div className="mb-6">
        <div className="mb-2 h-4 w-24 rounded shimmer" />
        <div className="h-9 w-40 rounded shimmer" />
        <div className="mt-1 h-4 w-28 rounded shimmer" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded shimmer" />
              <div className="h-4 w-12 rounded shimmer" />
            </div>
            <div className="mb-1 h-6 w-20 rounded shimmer" />
            <div className="h-4 w-16 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── Main Component ────────────── */

export function BalanceCards({
  balances,
  usdc,
  marketData,
  isLoading,
}: BalanceCardsProps) {
  if (isLoading) return <BalanceCardsSkeleton />;

  const holdings = computeHoldings(balances, marketData);
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const usdcBalance = usdc ? Number(formatUnits(usdc, 6)) : 0;

  return (
    <div>
      {/* Portfolio Value Header */}
      <div className="mb-6">
        <p
          className="mb-1 text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Portfolio Value
        </p>
        <p
          className="font-mono text-3xl font-bold tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          $
          {(totalValue + usdcBalance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p
          className="mt-1 font-mono text-sm tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          {usdcBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          USDC
        </p>
      </div>

      {/* Caliber Cards Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {holdings.map((h) => {
          const Icon = caliberIcons[h.caliber];
          return (
            <Link
              key={h.caliber}
              href={`/trade?caliber=${h.caliber.toLowerCase()}`}
              className="rounded-xl p-4 transition-colors hover:border-[var(--brass-border)]"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon size={20} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {h.symbol}
                </span>
              </div>
              <p
                className="font-mono text-lg font-medium tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {h.balance.toLocaleString()} rounds
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className="font-mono text-sm tabular-nums"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ${h.value.toFixed(2)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  ${h.price.toFixed(4)}/rd
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
