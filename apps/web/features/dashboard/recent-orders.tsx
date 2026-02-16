"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { caliberIcons } from "@/features/shared/caliber-icons";

/* ────────────── Types ────────────── */

type DisplayStatus = "Processing" | "Completed" | "Failed";

/* ────────────── Helpers ────────────── */

function mapOrderStatus(status: OrderFromAPI["status"]): DisplayStatus {
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

function timeAgo(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

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
        href="/mint"
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
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));

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
        {amount.toLocaleString()} rds
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
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));

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
          {amount.toLocaleString()} rounds
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
