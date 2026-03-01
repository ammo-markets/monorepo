"use client";

import { AlertTriangle } from "lucide-react";

interface PendingBannerProps {
  pendingCount: number;
}

export function PendingBanner({ pendingCount }: PendingBannerProps) {
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
    </div>
  );
}
