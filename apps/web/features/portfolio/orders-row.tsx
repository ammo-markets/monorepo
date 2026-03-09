"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { timeAgo } from "@/lib/utils";
import { StatusBadge, TypeBadge, mapOrderStatus } from "./portfolio-badges";
import type { OrderFromAPI } from "@/lib/types";

export function formatOrderAmount(order: OrderFromAPI): { value: string; label: string } {
  if (order.type === "MINT") {
    const val = order.usdcAmount ? (Number(order.usdcAmount) / 1e6).toFixed(2) : "\u2014";
    return { value: val, label: "USDT spent" };
  }
  const val = order.tokenAmount
    ? Math.floor(Number(order.tokenAmount) / 1e18).toLocaleString()
    : "\u2014";
  return { value: val, label: "rounds returned" };
}

export function OrdersDesktopRow({
  order,
  isLast,
}: {
  order: OrderFromAPI;
  isLast: boolean;
}) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status, order.type);
  const amount = formatOrderAmount(order);
  return (
    <tr
      className={`transition-colors duration-100 hover:bg-ax-tertiary ${order.id.startsWith("pending-") ? "" : "cursor-pointer"}`}
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border-default)",
      }}
      onClick={() => {
        if (!order.id.startsWith("pending-")) {
          router.push(`/portfolio/orders/${order.id}`);
        }
      }}
    >
      {/* Order ID */}
      <td className="px-6 py-4">
        {order.id.startsWith("pending-") ? (
          <span
            className="text-sm font-medium animate-pulse"
            style={{ color: "var(--amber)" }}
          >
            Indexing...
          </span>
        ) : (
          <span
            className="font-mono text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            #{order.id.slice(0, 8)}
          </span>
        )}
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
        <div className="flex flex-col items-end">
          <span
            className="font-mono text-sm tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {amount.value}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {amount.label}
          </span>
        </div>
      </td>
      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={displayStatus} />
      </td>
      {/* Created */}
      <td className="px-6 py-4 text-right">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {timeAgo(order.createdAt)}
        </span>
      </td>
    </tr>
  );
}

export function OrderMobileCard({ order }: { order: OrderFromAPI }) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status, order.type);
  const amount = formatOrderAmount(order);
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-150 bg-ax-secondary border border-border-default ${order.id.startsWith("pending-") ? "" : "cursor-pointer hover:border-brass-border"}`}
      onClick={() => {
        if (!order.id.startsWith("pending-")) {
          router.push(`/portfolio/orders/${order.id}`);
        }
      }}
      role={order.id.startsWith("pending-") ? undefined : "link"}
      tabIndex={order.id.startsWith("pending-") ? undefined : 0}
      onKeyDown={(e) => {
        if (!order.id.startsWith("pending-") && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          router.push(`/portfolio/orders/${order.id}`);
        }
      }}
    >
      <div className="flex items-center justify-between">
        {order.id.startsWith("pending-") ? (
          <span
            className="text-sm font-medium animate-pulse"
            style={{ color: "var(--amber)" }}
          >
            Indexing...
          </span>
        ) : (
          <span
            className="font-mono text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            #{order.id.slice(0, 8)}
          </span>
        )}
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
        <div className="flex flex-col">
          <span
            className="font-mono text-sm tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            {amount.value}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {amount.label}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo(order.createdAt)}
        </span>
        <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}
