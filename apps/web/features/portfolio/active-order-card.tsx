"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { timeAgo } from "@/lib/utils";
import type { OrderFromAPI, OrderStep } from "@/lib/types";
import { TypeBadge } from "./portfolio-badges";
import { buildOrderSteps, getCurrentStepIndex } from "./order-steps";
import { formatOrderAmount } from "./orders-row";

/* ── MiniStepper ── */

function MiniStepper({ steps }: { steps: OrderStep[] }) {
  const currentIdx = getCurrentStepIndex(steps);
  return (
    <div
      className="flex items-center gap-0"
      role="img"
      aria-label={`Step ${currentIdx + 1} of ${steps.length}`}
    >
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        let dotClass = "";
        let dotStyle: React.CSSProperties = {};

        if (step.status === "completed") {
          dotStyle = { backgroundColor: "var(--brass)" };
        } else if (step.status === "current") {
          dotStyle = {
            border: "2px solid var(--brass)",
            backgroundColor: "transparent",
          };
          dotClass = "relative";
        } else if (step.status === "failed") {
          dotStyle = { backgroundColor: "var(--red)" };
        } else {
          dotStyle = {
            border: "1.5px solid var(--text-muted)",
            backgroundColor: "transparent",
          };
        }

        const lineColor =
          step.status === "completed" ? "var(--brass)" : "var(--text-muted)";
        const lineOpacity = step.status === "completed" ? 1 : 0.3;

        return (
          <div key={i} className="flex items-center">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
              style={dotStyle}
            >
              {step.status === "current" && (
                <span
                  className="absolute inset-0 animate-ping rounded-full opacity-50"
                  style={{ backgroundColor: "var(--brass)" }}
                />
              )}
            </div>
            {!isLast && (
              <div
                className="h-px w-3"
                style={{ backgroundColor: lineColor, opacity: lineOpacity }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── ActiveOrderCard ── */

export function ActiveOrderCard({ order }: { order: OrderFromAPI }) {
  const router = useRouter();
  const Icon = caliberIcons[order.caliber];
  const steps = buildOrderSteps(order);
  const amount = formatOrderAmount(order);
  const isPending = order.id.startsWith("pending-");

  return (
    <div
      className={`rounded-xl px-4 py-3 transition-all duration-150 bg-ax-secondary border border-border-default ${
        isPending ? "" : "cursor-pointer hover:border-brass-border"
      }`}
      onClick={() => {
        if (!isPending) router.push(`/portfolio/orders/${order.id}`);
      }}
      role={isPending ? undefined : "link"}
      tabIndex={isPending ? undefined : 0}
      onKeyDown={(e) => {
        if (!isPending && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          router.push(`/portfolio/orders/${order.id}`);
        }
      }}
    >
      {/* Desktop: single row */}
      <div className="hidden items-center gap-4 sm:flex">
        <Icon size={20} />
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {order.caliber}
          </span>
          <TypeBadge type={order.type} />
        </div>
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {amount.value}{" "}
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {amount.label}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-4">
          <MiniStepper steps={steps} />
          {isPending ? (
            <span
              className="text-xs font-medium animate-pulse"
              style={{ color: "var(--amber)" }}
            >
              Indexing...
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {timeAgo(order.createdAt)}
            </span>
          )}
          <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Mobile: two rows */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={18} />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {order.caliber}
            </span>
            <TypeBadge type={order.type} />
          </div>
          {isPending ? (
            <span
              className="text-xs font-medium animate-pulse"
              style={{ color: "var(--amber)" }}
            >
              Indexing...
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {timeAgo(order.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-sm tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            {amount.value}{" "}
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {amount.label}
            </span>
          </span>
          <MiniStepper steps={steps} />
        </div>
      </div>
    </div>
  );
}
