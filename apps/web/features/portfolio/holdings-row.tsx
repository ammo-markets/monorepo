"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { Caliber } from "@ammo-exchange/shared";

export interface HoldingRow {
  caliber: Caliber;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
}

export function HoldingsDesktopRow({
  holding,
  onViewOrders,
}: {
  holding: HoldingRow;
  isLast: boolean;
  onViewOrders?: () => void;
}) {
  const Icon = caliberIcons[holding.caliber];
  return (
    <>
      {/* Caliber */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {holding.symbol}
          </span>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {holding.name}
          </span>
        </div>
      </td>
      {/* Balance */}
      <td className="px-6 py-4 text-right">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {holding.balance.toLocaleString()} rounds
        </span>
      </td>
      {/* Price */}
      <td className="px-6 py-4 text-right">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          ${holding.price.toFixed(4)}/rd
        </span>
      </td>
      {/* Value */}
      <td className="px-6 py-4 text-right">
        <span
          className="font-mono text-sm font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${holding.value.toFixed(2)}
        </span>
      </td>
      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/exchange?tab=mint&caliber=${holding.caliber.toLowerCase()}`}
            className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 bg-brass text-ax-primary hover:bg-brass-hover"
          >
            Mint More
          </Link>
          <Link
            href={`/exchange?tab=redeem&caliber=${holding.caliber.toLowerCase()}`}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 bg-transparent border border-border-hover text-text-secondary hover:bg-ax-tertiary hover:text-text-primary"
          >
            Redeem
          </Link>
          {onViewOrders && (
            <button
              type="button"
              onClick={onViewOrders}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 text-text-muted hover:text-text-primary"
            >
              Orders
            </button>
          )}
        </div>
      </td>
    </>
  );
}

export function HoldingsMobileCard({
  holding,
  onViewOrders,
}: {
  holding: HoldingRow;
  onViewOrders?: () => void;
}) {
  const Icon = caliberIcons[holding.caliber];
  const router = useRouter();

  return (
    <div
      className="cursor-pointer rounded-xl p-4 transition-colors duration-150 hover:border-brass-border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/calibers/${holding.caliber.toLowerCase()}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/calibers/${holding.caliber.toLowerCase()}`);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon size={22} />
          <div>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {holding.symbol}
            </span>
            <span
              className="ml-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {holding.name}
            </span>
          </div>
        </div>
        <span
          className="font-mono text-lg font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${holding.value.toFixed(2)}
        </span>
      </div>

      {/* Data grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <span
            className="text-[11px] uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Balance
          </span>
          <div
            className="mt-0.5 font-mono text-sm tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {holding.balance.toLocaleString()} rounds
          </div>
        </div>
        <div>
          <span
            className="text-[11px] uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Price
          </span>
          <div
            className="mt-0.5 font-mono text-sm tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            ${holding.price.toFixed(4)}/rd
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Link
            href={`/exchange?tab=mint&caliber=${holding.caliber.toLowerCase()}`}
            className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors duration-150"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
          >
            Mint More
          </Link>
          <Link
            href={`/exchange?tab=redeem&caliber=${holding.caliber.toLowerCase()}`}
            className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-hover)",
              color: "var(--text-secondary)",
            }}
          >
            Redeem
          </Link>
        </div>
        {onViewOrders && (
          <button
            type="button"
            onClick={onViewOrders}
            className="text-xs font-medium transition-colors duration-150"
            style={{ color: "var(--text-muted)" }}
          >
            View {holding.caliber} orders ↓
          </button>
        )}
      </div>
    </div>
  );
}
