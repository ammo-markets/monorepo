"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { timeAgo } from "@/lib/utils";
import { StatusBadge, TypeBadge, mapOrderStatus } from "@/features/portfolio/portfolio-badges";

/* ────────────── Skeleton ────────────── */

function RecentOrdersSkeleton() {
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
          className="flex items-center gap-4 px-5 py-4"
          style={{
            borderBottom: i < 3 ? "1px solid var(--border-default)" : "none",
          }}
        >
          <div className="h-5 w-14 rounded-full shimmer" />
          <div className="h-5 w-20 rounded shimmer" />
          <div className="ml-auto flex gap-4">
            <div className="h-5 w-16 rounded shimmer" />
            <div className="h-5 w-14 rounded-full shimmer" />
            <div className="h-4 w-12 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────── Empty State ────────────── */

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
        Start by minting some tokens.
      </p>
      <Link
        href="/exchange?tab=mint"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: "var(--brass)",
          color: "var(--bg-primary)",
        }}
      >
        Start Minting
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

/* ────────────── Props ────────────── */

interface RecentOrdersProps {
  orders: OrderFromAPI[];
  isLoading: boolean;
}

/* ────────────── Desktop Row ────────────── */

function OrderRow({ order }: { order: OrderFromAPI }) {
  const Icon = caliberIcons[order.caliber as Caliber];
  const displayStatus = mapOrderStatus(order.status, order.type);
  const amountDisplay =
    order.type === "MINT"
      ? order.usdcAmount
        ? `${(Number(order.usdcAmount) / 1e6).toFixed(2)} USDT`
        : "\u2014"
      : order.tokenAmount
        ? `${Math.floor(Number(order.tokenAmount) / 1e18).toLocaleString()} rds`
        : "\u2014";

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5"
      style={{ borderBottom: "1px solid var(--border-default)" }}
    >
      <TypeBadge type={order.type} />
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {order.caliber}
        </span>
      </div>
      <span
        className="font-mono text-sm tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {amountDisplay}
      </span>
      <div className="ml-auto flex items-center gap-4">
        <StatusBadge status={displayStatus} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo(order.createdAt)}
        </span>
      </div>
    </div>
  );
}

/* ────────────── Mobile Card ────────────── */

function OrderCard({ order }: { order: OrderFromAPI }) {
  const Icon = caliberIcons[order.caliber as Caliber];
  const displayStatus = mapOrderStatus(order.status, order.type);
  const amountDisplay =
    order.type === "MINT"
      ? order.usdcAmount
        ? `${(Number(order.usdcAmount) / 1e6).toFixed(2)} USDT`
        : "\u2014"
      : order.tokenAmount
        ? `${Math.floor(Number(order.tokenAmount) / 1e18).toLocaleString()} rounds`
        : "\u2014";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeBadge type={order.type} />
          <Icon size={16} />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            {order.caliber}
          </span>
        </div>
        <StatusBadge status={displayStatus} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {amountDisplay}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo(order.createdAt)}
        </span>
      </div>
    </div>
  );
}

/* ────────────── Main Component ────────────── */

export function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) return <RecentOrdersSkeleton />;
  if (orders.length === 0) return <EmptyOrders />;

  const recent = orders.slice(0, 5);

  return (
    <div>
      {/* Desktop */}
      <div
        className="hidden overflow-hidden rounded-xl md:block"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {recent.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {recent.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* View All */}
      <div className="mt-3 flex justify-end">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--brass)" }}
        >
          View All Orders
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
