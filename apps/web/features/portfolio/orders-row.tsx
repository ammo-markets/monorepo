"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { StatusBadge, TypeBadge, mapOrderStatus } from "./portfolio-badges";
import type { OrderFromAPI } from "@/lib/types";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));
  return (
    <tr
      className="cursor-pointer transition-colors duration-100 hover:bg-ax-tertiary"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border-default)",
      }}
      onClick={() => router.push(`/portfolio/orders/${order.id}`)}
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

export function OrderMobileCard({ order }: { order: OrderFromAPI }) {
  const Icon = caliberIcons[order.caliber];
  const router = useRouter();
  const displayStatus = mapOrderStatus(order.status);
  const amount = Math.floor(Number(order.amount));
  return (
    <div
      className="cursor-pointer rounded-xl p-4 transition-all duration-150 bg-ax-secondary border border-border-default hover:border-brass-border"
      onClick={() => router.push(`/portfolio/orders/${order.id}`)}
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
