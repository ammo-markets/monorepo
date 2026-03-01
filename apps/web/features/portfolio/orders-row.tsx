"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { timeAgo } from "@/lib/utils";
import { StatusBadge, TypeBadge, mapOrderStatus } from "./portfolio-badges";
import type { OrderFromAPI } from "@/lib/types";

export function OrdersDesktopRow({
  order,
  isLast,
}: {
  order: OrderFromAPI;
  isLast: boolean;
}) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status);
  const amountDisplay =
    order.type === "MINT"
      ? order.usdcAmount
        ? `${(Number(order.usdcAmount) / 1e6).toFixed(2)} USDC`
        : "\u2014"
      : order.tokenAmount
        ? `${Math.floor(Number(order.tokenAmount) / 1e18).toLocaleString()} rounds`
        : "\u2014";
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
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {amountDisplay}
        </span>
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
  const displayStatus = mapOrderStatus(order.status);
  const amountDisplay =
    order.type === "MINT"
      ? order.usdcAmount
        ? `${(Number(order.usdcAmount) / 1e6).toFixed(2)} USDC`
        : "\u2014"
      : order.tokenAmount
        ? `${Math.floor(Number(order.tokenAmount) / 1e18).toLocaleString()} rounds`
        : "\u2014";
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
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {amountDisplay}
        </span>
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
