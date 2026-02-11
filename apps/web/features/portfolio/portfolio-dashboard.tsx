"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import {
  Lock,
  Wallet,
  Copy,
  ExternalLink,
  Check,
  Info,
  ArrowRight,
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { truncateAddress, snowtraceAddressUrl } from "@/lib/utils";
import type { OrderFromAPI, MarketCaliberFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import { caliberIcons } from "@/features/shared/caliber-icons";

/* ────────────── Constants ────────────── */

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];

/* ────────────── Types ────────────── */

type OrderFilter = "All" | "Active" | "Completed" | "Failed";

type DisplayStatus = "Processing" | "Completed" | "Failed";

interface HoldingRow {
  caliber: Caliber;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
}

/* ────────────── Helpers ────────────── */

function mapOrderStatus(
  status: OrderFromAPI["status"],
): DisplayStatus {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
      return "Processing";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
    case "CANCELLED":
      return "Failed";
  }
}

const statusColors: Record<DisplayStatus, string> = {
  Processing: "var(--blue)",
  Completed: "var(--green)",
  Failed: "var(--red)",
};

function StatusBadge({ status }: { status: DisplayStatus }) {
  const color = statusColors[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: "MINT" | "REDEEM" }) {
  const label = type === "MINT" ? "Mint" : "Redeem";
  const color = type === "MINT" ? "var(--green)" : "var(--amber)";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ────────────── Skeleton Components ────────────── */

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-3 h-7 w-28 rounded shimmer" />
        <div className="mb-2 h-10 w-40 rounded shimmer" />
        <div className="h-5 w-32 rounded shimmer" />
      </div>
      <div className="h-10 w-44 rounded-lg shimmer" />
    </div>
  );
}

function HoldingsTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-5"
          style={{
            borderBottom: i < 2 ? "1px solid var(--border-default)" : "none",
          }}
        >
          <div className="h-6 w-6 rounded shimmer" />
          <div className="h-5 w-32 rounded shimmer" />
          <div className="ml-auto flex gap-8">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-5 w-16 rounded shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-5"
          style={{
            borderBottom: i < 3 ? "1px solid var(--border-default)" : "none",
          }}
        >
          <div className="h-5 w-28 rounded shimmer" />
          <div className="h-5 w-14 rounded-full shimmer" />
          <div className="h-5 w-10 rounded shimmer" />
          <div className="ml-auto flex gap-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-5 w-20 rounded shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────── Empty States ────────────── */

function EmptyHoldings() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Empty vault SVG */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-5"
      >
        <rect
          x="8"
          y="12"
          width="48"
          height="40"
          rx="4"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <rect
          x="12"
          y="16"
          width="40"
          height="32"
          rx="2"
          stroke="var(--text-muted)"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx="32"
          cy="32"
          r="10"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="3"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <line
          x1="32"
          y1="22"
          x2="32"
          y2="26"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="32"
          y1="38"
          x2="32"
          y2="42"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="22"
          y1="32"
          x2="26"
          y2="32"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="38"
          y1="32"
          x2="42"
          y2="32"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <rect
          x="48"
          y="24"
          width="6"
          height="16"
          rx="2"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
      </svg>
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {"You don't hold any ammo tokens yet."}
      </p>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Start minting to build your position.
      </p>
      <a
        href="/mint"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: "var(--brass)",
          color: "var(--bg-primary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass)";
        }}
      >
        Start Minting
        <ArrowRight size={16} />
      </a>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-12 text-center"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        No orders yet.
      </p>
      <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Mint your first tokens to get started.
      </p>
      <a
        href="/mint"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: "var(--brass)",
          color: "var(--bg-primary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass)";
        }}
      >
        Start Minting
      </a>
    </div>
  );
}

/* ────────────── Disconnected State ────────────── */

function DisconnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="flex max-w-md flex-col items-center rounded-2xl px-8 py-16 text-center"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <Lock size={28} style={{ color: "var(--text-muted)" }} />
        </div>
        <h2
          className="mb-2 text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Connect your wallet to view your portfolio
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Link your wallet to see your holdings, track orders, and manage your
          ammo tokens.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
          onClick={onConnect}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass)";
          }}
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

/* ────────────── Holdings Section ────────────── */

function HoldingsDesktopRow({
  holding,
}: {
  holding: HoldingRow;
  isLast: boolean;
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
        <div className="flex items-center justify-end gap-2">
          <a
            href={`/mint?caliber=${holding.caliber}`}
            className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass)";
            }}
          >
            Mint More
          </a>
          <a
            href={`/redeem?caliber=${holding.caliber}`}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-hover)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Redeem
          </a>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-hover)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Trade
            <ExternalLink size={11} />
          </button>
        </div>
      </td>
    </>
  );
}

function HoldingsMobileCard({ holding }: { holding: HoldingRow }) {
  const Icon = caliberIcons[holding.caliber];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
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
      <div className="mt-4 flex items-center gap-2">
        <a
          href={`/mint?caliber=${holding.caliber}`}
          className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
        >
          Mint More
        </a>
        <a
          href={`/redeem?caliber=${holding.caliber}`}
          className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors duration-150"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--border-hover)",
            color: "var(--text-secondary)",
          }}
        >
          Redeem
        </a>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--border-hover)",
            color: "var(--text-secondary)",
          }}
        >
          Trade
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

/* ────────────── Orders Section ────────────── */

function OrdersDesktopRow({
  order,
  isLast,
}: {
  order: OrderFromAPI;
  isLast: boolean;
}) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));
  return (
    <tr
      className="cursor-pointer transition-colors duration-100"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border-default)",
      }}
      onClick={() => router.push(`/portfolio/orders/${order.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Order ID */}
      <td className="px-6 py-4">
        <span
          className="font-mono text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          #{order.id.slice(0, 8)}
        </span>
      </td>
      {/* Type */}
      <td className="px-6 py-4">
        <TypeBadge type={order.type} />
      </td>
      {/* Caliber */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            {order.caliber}
          </span>
        </div>
      </td>
      {/* Amount */}
      <td className="px-6 py-4 text-right">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {amount.toLocaleString()} rounds
        </span>
      </td>
      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={displayStatus} />
      </td>
      {/* Created */}
      <td className="px-6 py-4 text-right">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {formatDate(order.createdAt)}
        </span>
      </td>
    </tr>
  );
}

function OrderMobileCard({ order }: { order: OrderFromAPI }) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));
  return (
    <div
      className="cursor-pointer rounded-xl p-4 transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      onClick={() => router.push(`/portfolio/orders/${order.id}`)}
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
          router.push(`/portfolio/orders/${order.id}`);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          #{order.id.slice(0, 8)}
        </span>
        <StatusBadge status={displayStatus} />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <TypeBadge type={order.type} />
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            {order.caliber}
          </span>
        </div>
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {amount.toLocaleString()} rounds
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatDate(order.createdAt)}
        </span>
        <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}

/* ────────────── Primers Section ────────────── */

function PrimersSection({ primers }: { primers: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Primers
        </h2>
        <div className="relative">
          <button
            type="button"
            className="flex items-center justify-center"
            aria-label="What are Primers?"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <Info size={15} style={{ color: "var(--text-muted)" }} />
          </button>
          {showTooltip && (
            <div
              className="absolute left-1/2 bottom-full mb-2 w-56 -translate-x-1/2 rounded-lg px-3 py-2 text-xs leading-relaxed"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)",
                zIndex: 50,
              }}
            >
              Loyalty points earned from liquidity provision. Future utility to
              be announced.
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {primers > 0 ? (
          <>
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: "var(--brass)" }}
            >
              {primers.toLocaleString()}
            </span>
            <span
              className="ml-2 text-lg font-medium"
              style={{ color: "var(--brass)" }}
            >
              Primers
            </span>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Earned from providing liquidity to ammo token pools.
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Future utility to be announced.
            </p>
          </>
        ) : (
          <>
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: "var(--text-muted)" }}
            >
              0
            </span>
            <span
              className="ml-2 text-lg font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Primers
            </span>
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Provide liquidity on a DEX to start earning Primers.
            </p>
            <a
              href="#"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--brass)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brass-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--brass)";
              }}
            >
              Learn More
              <ArrowRight size={14} />
            </a>
          </>
        )}
      </div>
    </section>
  );
}

/* ────────────── Main Dashboard ────────────── */

export function PortfolioDashboard() {
  const { address, isConnected, isReconnecting, connect } = useWallet();
  const { tokens, usdc, isLoading: balancesLoading } = useTokenBalances();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("All");

  // Market prices
  const [marketData, setMarketData] = useState<MarketCaliberFromAPI[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);

  // Orders
  const [orders, setOrders] = useState<OrderFromAPI[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch market prices
  useEffect(() => {
    setMarketLoading(true);
    fetch("/api/market")
      .then((r) => r.json())
      .then((data) => setMarketData(data.calibers ?? []))
      .catch(() => setMarketData([]))
      .finally(() => setMarketLoading(false));
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!address) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    fetch(`/api/orders?wallet=${address}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [address]);

  // Compute holdings from on-chain balances + market prices
  const holdings: HoldingRow[] = useMemo(() => {
    const priceMap = new Map(
      marketData.map((m) => [m.caliber, m.pricePerRound]),
    );

    return CALIBERS.map((caliber) => {
      const raw = tokens[caliber] ?? BigInt(0);
      const balance = Math.floor(Number(formatUnits(raw, 18)));
      const price = priceMap.get(caliber) ?? 0;
      const value = balance * price;
      const spec = CALIBER_SPECS[caliber];
      return {
        caliber,
        symbol: caliber,
        name: spec.name,
        balance,
        price,
        value,
      };
    }).filter((h) => h.balance > 0);
  }, [tokens, marketData]);

  // Total portfolio value
  const totalValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.value, 0);
  }, [holdings]);

  // USDC balance display
  const usdcBalance = usdc ? Number(formatUnits(usdc, 6)) : 0;

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === "All") return orders;
    if (orderFilter === "Active")
      return orders.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING",
      );
    if (orderFilter === "Completed")
      return orders.filter((o) => o.status === "COMPLETED");
    return orders.filter(
      (o) => o.status === "FAILED" || o.status === "CANCELLED",
    );
  }, [orderFilter, orders]);

  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address).catch(() => {});
    }
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  }, [address]);

  // Show loading skeleton during reconnection (prevents hydration mismatch)
  if (isReconnecting) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <HeaderSkeleton />
        <section className="mt-10">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Holdings
          </h2>
          <HoldingsTableSkeleton />
        </section>
        <section className="mt-10">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Orders
          </h2>
          <OrdersTableSkeleton />
        </section>
      </div>
    );
  }

  if (!isConnected) {
    return <DisconnectedState onConnect={connect} />;
  }

  const dataLoading = balancesLoading || marketLoading;
  const orderFilterTabs: OrderFilter[] = [
    "All",
    "Active",
    "Completed",
    "Failed",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Section 1: Portfolio Value Header */}
      {dataLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="mb-1 text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Portfolio
            </h1>
            <p
              className="font-mono text-4xl font-bold tabular-nums tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              ${totalValue.toFixed(2)}
            </p>
            {usdcBalance > 0 && (
              <p
                className="mt-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                + ${usdcBalance.toFixed(2)} USDC available
              </p>
            )}
          </div>

          {/* Wallet address */}
          {address && (
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-2.5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {/* Identicon */}
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: "var(--brass-muted)",
                  color: "var(--brass)",
                }}
              >
                {address.slice(2, 3).toUpperCase()}
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {truncateAddress(address)}
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onClick={handleCopyAddress}
                aria-label="Copy address"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={snowtraceAddressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                aria-label="View on explorer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Holdings */}
      <section className="mt-10">
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Holdings
        </h2>

        {dataLoading ? (
          <HoldingsTableSkeleton />
        ) : holdings.length === 0 ? (
          <EmptyHoldings />
        ) : (
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
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Caliber
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Balance
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Price
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Value
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, i) => (
                      <tr
                        key={holding.caliber}
                        className="transition-colors duration-100"
                        style={{
                          borderBottom:
                            i < holdings.length - 1
                              ? "1px solid var(--border-default)"
                              : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <HoldingsDesktopRow
                          holding={holding}
                          isLast={i === holdings.length - 1}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {holdings.map((holding) => (
                <HoldingsMobileCard key={holding.caliber} holding={holding} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Section 3: Orders */}
      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Orders
          </h2>
          {/* Tab filters */}
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            {orderFilterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor:
                    orderFilter === tab ? "var(--bg-tertiary)" : "transparent",
                  color:
                    orderFilter === tab
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  border:
                    orderFilter === tab
                      ? "1px solid var(--border-hover)"
                      : "1px solid transparent",
                }}
                onClick={() => setOrderFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {ordersLoading ? (
          <OrdersTableSkeleton />
        ) : filteredOrders.length === 0 ? (
          orderFilter === "All" ? (
            <EmptyOrders />
          ) : (
            <div
              className="flex items-center justify-center rounded-xl px-6 py-10 text-center"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No {orderFilter.toLowerCase()} orders.
              </p>
            </div>
          )
        ) : (
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
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Order ID
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Caliber
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Amount
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, i) => (
                      <OrdersDesktopRow
                        key={order.id}
                        order={order}
                        isLast={i === filteredOrders.length - 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredOrders.map((order) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Section 4: Primers */}
      <div className="mt-10">
        <PrimersSection primers={0} />
      </div>
    </div>
  );
}
