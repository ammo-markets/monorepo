"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  type CaliberId,
  type OrderDetail,
  type StepStatus,
  type OrderStep,
  orderDetails,
} from "@/lib/mock-data";
import { caliberIcons } from "./caliber-icons";

/* ────────────── Helpers ────────────── */

function TypeBadge({ type }: { type: "Mint" | "Redeem" }) {
  const color = type === "Mint" ? "var(--green)" : "var(--amber)";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderDetail["status"] }) {
  const colorMap: Record<OrderDetail["status"], string> = {
    Processing: "var(--blue)",
    Shipped: "var(--green)",
    Completed: "var(--green)",
    Failed: "var(--red)",
  };
  const color = colorMap[status];
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

/* ────────────── Step Icon ────────────── */

function StepIcon({ status }: { status: StepStatus }) {
  const size = 32;

  if (status === "completed") {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--brass)",
        }}
      >
        <Check
          size={16}
          strokeWidth={3}
          style={{ color: "var(--bg-primary)" }}
        />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div
        className="relative flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: "2px solid var(--brass)",
          backgroundColor: "transparent",
        }}
      >
        {/* Pulsing dot */}
        <span
          className="absolute h-3 w-3 animate-ping rounded-full opacity-60"
          style={{ backgroundColor: "var(--brass)" }}
        />
        <span
          className="relative h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "var(--brass)" }}
        />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "var(--red)",
        }}
      >
        <X size={16} strokeWidth={3} style={{ color: "#fff" }} />
      </div>
    );
  }

  // future
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--text-muted)",
        backgroundColor: "transparent",
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: "var(--text-muted)" }}
      />
    </div>
  );
}

/* ────────────── Desktop Stepper (horizontal) ────────────── */

function DesktopStepper({ steps }: { steps: OrderStep[] }) {
  return (
    <div className="hidden sm:block">
      <div className="flex items-start">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const labelColor =
            step.status === "completed"
              ? "var(--text-primary)"
              : step.status === "current"
                ? "var(--text-primary)"
                : step.status === "failed"
                  ? "var(--red)"
                  : "var(--text-muted)";

          const lineColor =
            step.status === "completed" ? "var(--brass)" : "var(--text-muted)";

          return (
            <div
              key={step.label}
              className="flex flex-1 flex-col items-center"
              style={{ minWidth: 0 }}
            >
              {/* Icon + line row */}
              <div className="flex w-full items-center">
                {/* Left half line */}
                {i > 0 ? (
                  <div
                    className="h-0.5 flex-1"
                    style={{
                      backgroundColor:
                        steps[i - 1]?.status === "completed"
                          ? "var(--brass)"
                          : "var(--text-muted)",
                      opacity: steps[i - 1]?.status === "completed" ? 1 : 0.3,
                    }}
                  />
                ) : (
                  <div className="flex-1" />
                )}

                <StepIcon status={step.status} />

                {/* Right half line */}
                {!isLast ? (
                  <div
                    className="h-0.5 flex-1"
                    style={{
                      backgroundColor: lineColor,
                      opacity: step.status === "completed" ? 1 : 0.3,
                    }}
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>

              {/* Label */}
              <span
                className="mt-3 text-center text-xs font-semibold leading-tight"
                style={{
                  color: labelColor,
                  fontWeight: step.status === "current" ? 700 : 600,
                }}
              >
                {step.label}
              </span>

              {/* Meta */}
              {step.meta && (
                <span
                  className="mt-1 max-w-[120px] text-center text-[11px] leading-snug"
                  style={{
                    color:
                      step.status === "failed"
                        ? "var(--red)"
                        : "var(--text-muted)",
                  }}
                >
                  {step.link ? (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 transition-colors duration-150"
                      style={{ color: "var(--brass)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--brass-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--brass)";
                      }}
                    >
                      {step.meta}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    step.meta
                  )}
                </span>
              )}

              {/* Error message */}
              {step.errorMessage && (
                <div
                  className="mt-2 max-w-[160px] rounded-md px-2 py-1.5 text-center text-[11px] leading-snug"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--red) 10%, transparent)",
                    color: "var(--red)",
                    border:
                      "1px solid color-mix(in srgb, var(--red) 25%, transparent)",
                  }}
                >
                  {step.errorMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────── Mobile Stepper (vertical) ────────────── */

function MobileStepper({ steps }: { steps: OrderStep[] }) {
  return (
    <div className="block sm:hidden">
      <div className="flex flex-col">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const labelColor =
            step.status === "completed"
              ? "var(--text-primary)"
              : step.status === "current"
                ? "var(--text-primary)"
                : step.status === "failed"
                  ? "var(--red)"
                  : "var(--text-muted)";

          return (
            <div key={step.label} className="flex gap-4">
              {/* Vertical track: icon + connecting line */}
              <div className="flex flex-col items-center">
                <StepIcon status={step.status} />
                {!isLast && (
                  <div
                    className="my-1 w-0.5 flex-1"
                    style={{
                      backgroundColor:
                        step.status === "completed"
                          ? "var(--brass)"
                          : "var(--text-muted)",
                      opacity: step.status === "completed" ? 1 : 0.3,
                      minHeight: 24,
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <span
                  className="text-sm leading-none"
                  style={{
                    color: labelColor,
                    fontWeight: step.status === "current" ? 700 : 600,
                  }}
                >
                  {step.label}
                </span>

                {step.meta && (
                  <div
                    className="mt-1 text-xs"
                    style={{
                      color:
                        step.status === "failed"
                          ? "var(--red)"
                          : "var(--text-muted)",
                    }}
                  >
                    {step.link ? (
                      <a
                        href={step.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 transition-colors duration-150"
                        style={{ color: "var(--brass)" }}
                      >
                        {step.meta}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      step.meta
                    )}
                  </div>
                )}

                {step.errorMessage && (
                  <div
                    className="mt-2 max-w-sm rounded-md px-3 py-2 text-xs leading-snug"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--red) 10%, transparent)",
                      color: "var(--red)",
                      border:
                        "1px solid color-mix(in srgb, var(--red) 25%, transparent)",
                    }}
                  >
                    {step.errorMessage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────── Skeleton ────────────── */

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:py-12">
      {/* Back link */}
      <div className="mb-8 h-5 w-40 rounded shimmer" />
      {/* Stepper card */}
      <div
        className="mb-6 rounded-xl p-6 sm:p-8"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-6 h-6 w-32 rounded shimmer" />
        <div className="hidden sm:flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <React.Fragment key={i}>
              <div className="h-8 w-8 rounded-full shimmer" />
              {i < 5 && <div className="h-0.5 flex-1 shimmer" />}
            </React.Fragment>
          ))}
        </div>
        <div className="block sm:hidden flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full shimmer" />
              <div className="h-5 w-32 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
      {/* Details card */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-6 h-6 w-28 rounded shimmer" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <div className="mb-2 h-3 w-16 rounded shimmer" />
              <div className="h-5 w-28 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────── Detail Row ────────────── */

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[11px] font-medium uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div className="text-sm" style={{ color: "var(--text-primary)" }}>
        {children}
      </div>
    </div>
  );
}

/* ────────────── Demo Variant Selector ────────────── */

const demoOrders = [
  { id: "AMX-2024-001", label: "Mint — Processing" },
  { id: "AMX-2024-002", label: "Mint — Completed" },
  { id: "AMX-2024-003", label: "Mint — Failed" },
  { id: "AMX-R-2024-015", label: "Redeem — Shipped" },
  { id: "AMX-R-2024-010", label: "Redeem — Delivered" },
];

/* ────────────── Main Component ────────────── */

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(orderId);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [activeOrderId]);

  const order = orderDetails[activeOrderId];

  if (isLoading) {
    return (
      <>
        {/* Variant selector always visible */}
        <VariantSelector activeId={activeOrderId} onChange={setActiveOrderId} />
        <OrderDetailSkeleton />
      </>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8 sm:py-12">
        <Link
          href="/portfolio"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--brass)" }}
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
        <div
          className="flex flex-col items-center justify-center rounded-xl px-6 py-20 text-center"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <AlertTriangle
            size={36}
            className="mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {"Order not found."}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {"The order ID you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  const Icon = caliberIcons[order.caliberId];

  return (
    <>
      <VariantSelector activeId={activeOrderId} onChange={setActiveOrderId} />

      <div className="mx-auto max-w-[720px] px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/portfolio"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--brass)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--brass)";
          }}
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>

        {/* ── Status Stepper Card ── */}
        <div
          className="mb-6 rounded-xl p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          {/* Card header */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Order Progress
            </h2>
            <StatusBadge status={order.status} />
          </div>

          {/* Stepper */}
          <DesktopStepper steps={order.steps} />
          <MobileStepper steps={order.steps} />
        </div>

        {/* ── Order Details Card ── */}
        <div
          className="mb-6 rounded-xl p-6 sm:p-8"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <h3
            className="mb-6 text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Order Details
          </h3>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Order ID">
              <span className="font-mono">#{order.orderId}</span>
            </DetailRow>

            <DetailRow label="Type">
              <TypeBadge type={order.type} />
            </DetailRow>

            <DetailRow label="Caliber">
              <div className="flex items-center gap-2">
                <Icon size={18} />
                <span>
                  {order.symbol} — {order.caliberFullName}
                </span>
              </div>
            </DetailRow>

            <DetailRow label="Amount">
              <span className="font-mono tabular-nums">
                {order.amount.toLocaleString()} rounds
              </span>
            </DetailRow>

            <DetailRow label="Fee">
              <span className="font-mono tabular-nums">{order.fee}</span>
            </DetailRow>

            <DetailRow label="Status">
              <StatusBadge status={order.status} />
            </DetailRow>

            <DetailRow label="Created">
              <span>{order.createdAt}</span>
            </DetailRow>

            <DetailRow label="Last Updated">
              <span>{order.lastUpdated}</span>
            </DetailRow>

            {order.txHash && (
              <DetailRow label="Transaction">
                <a
                  href={`https://snowtrace.io/tx/${order.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm transition-colors duration-150"
                  style={{ color: "var(--brass)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--brass-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--brass)";
                  }}
                >
                  {order.txHashShort}
                  <ExternalLink size={12} />
                </a>
              </DetailRow>
            )}

            {order.shippingAddress && (
              <DetailRow label="Shipping Address">
                <span style={{ color: "var(--text-secondary)" }}>
                  {order.shippingAddress}
                </span>
              </DetailRow>
            )}

            {order.trackingNumber && (
              <DetailRow label="Tracking Number">
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm transition-colors duration-150"
                  style={{ color: "var(--brass)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--brass-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--brass)";
                  }}
                >
                  {order.trackingNumber}
                  <ExternalLink size={12} />
                </a>
              </DetailRow>
            )}
          </div>
        </div>

        {/* ── Support Section ── */}
        <div
          className="rounded-xl p-5 sm:p-6"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Having issues with this order?
              </p>
              <a
                href="#"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                style={{ color: "var(--brass)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--brass-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--brass)";
                }}
              >
                Contact Support
                <ArrowLeft size={14} className="rotate-180" />
              </a>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 sm:self-auto"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <MessageSquare size={14} />
              Report a Problem
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────── Variant Selector (demo only) ────────────── */

function VariantSelector({
  activeId,
  onChange,
}: {
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-[720px] px-4 pt-6 sm:pt-8">
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Demo — View order variants
        </p>
        <div className="flex flex-wrap gap-2">
          {demoOrders.map((d) => {
            const isActive = d.id === activeId;
            return (
              <button
                key={d.id}
                type="button"
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor: isActive
                    ? "var(--brass-muted)"
                    : "var(--bg-secondary)",
                  border: `1px solid ${isActive ? "var(--brass-border)" : "var(--border-default)"}`,
                  color: isActive ? "var(--brass)" : "var(--text-secondary)",
                }}
                onClick={() => onChange(d.id)}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
