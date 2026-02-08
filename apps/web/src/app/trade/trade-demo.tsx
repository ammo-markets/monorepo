"use client";

import { useState } from "react";
import { SwapWidget } from "@/components/ammo/swap-widget";
import { ArrowDownUp } from "lucide-react";

export function TradeDemo() {
  const [widgetOpen, setWidgetOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Standalone widget (inline, not modal) */}
      <div className="w-full max-w-[420px]">
        <SwapWidget defaultOpen />
      </div>

      {/* Also show how to trigger as modal */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          This widget can also be triggered as a modal from any Trade button:
        </p>
        <SwapWidget
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--brass-border)";
                e.currentTarget.style.color = "var(--brass)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              <ArrowDownUp size={16} />
              Open Trade Modal
            </button>
          }
        />
      </div>
    </div>
  );
}
