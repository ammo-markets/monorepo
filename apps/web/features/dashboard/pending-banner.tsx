"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

interface PendingBannerProps {
  pendingCount: number;
  onViewOrders?: () => void;
}

export function PendingBanner({ pendingCount, onViewOrders }: PendingBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--amber) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
      }}
    >
      <AlertTriangle size={18} style={{ color: "var(--amber)" }} />
      <p className="flex-1 text-sm" style={{ color: "var(--amber)" }}>
        You have {pendingCount} pending order{pendingCount > 1 ? "s" : ""}{" "}
        awaiting processing
      </p>
      {onViewOrders && (
        <button
          type="button"
          onClick={onViewOrders}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--amber)" }}
        >
          View Orders
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
