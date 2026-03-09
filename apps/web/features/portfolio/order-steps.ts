import type { OrderFromAPI, OrderStep } from "@/lib/types";
import { truncateAddress, snowtraceUrl, formatDate } from "@/lib/utils";
import { formatUsdc } from "@/lib/tx-utils";

/* ── Step builders ── */

export function buildMintSteps(order: OrderFromAPI): OrderStep[] {
  const isCompleted = order.status === "COMPLETED";
  const isFailed = order.status === "FAILED" || order.status === "CANCELLED";
  return [
    {
      label: "Tokens Minted",
      status: isCompleted ? "completed" : isFailed ? "failed" : "current",
      meta: order.txHash ? `Tx: ${truncateAddress(order.txHash)}` : undefined,
      link: order.txHash ? { url: snowtraceUrl(order.txHash), label: "View on Snowtrace" } : undefined,
    },
    {
      label: "Completed",
      status: isCompleted ? "completed" : isFailed ? "failed" : "future",
      meta: isCompleted ? formatDate(order.updatedAt) : undefined,
    },
  ];
}

export function buildRedeemSteps(order: OrderFromAPI): OrderStep[] {
  const status = order.status;
  const isFailed = status === "FAILED" || status === "CANCELLED";
  const isCompleted = status === "COMPLETED";

  // Status ordering: PENDING < APPROVED < PAID < COMPLETED
  const statusRank: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 0, // same as pending for legacy compat
    APPROVED: 1,
    PAID: 2,
    COMPLETED: 3,
    FAILED: -1,
    CANCELLED: -1,
  };

  const rank = statusRank[status] ?? 0;

  // Format costs for display
  const shippingDisplay = order.shippingCost
    ? `$${formatUsdc(BigInt(order.shippingCost))} shipping`
    : undefined;
  const feeDisplay = order.protocolFee
    ? `+ $${formatUsdc(BigInt(order.protocolFee))} fee`
    : undefined;
  const costMeta =
    shippingDisplay && feeDisplay
      ? `${shippingDisplay} ${feeDisplay}`
      : shippingDisplay;

  return [
    // Step 1: Redemption Requested
    {
      label: "Redemption Requested",
      status: isFailed ? "failed" : "completed",
      meta: formatDate(order.createdAt),
    },
    // Step 2: Approved
    {
      label: "Approved",
      status: isFailed
        ? "failed"
        : rank >= 1
          ? "completed"
          : "current",
      meta:
        rank >= 1
          ? costMeta ?? "Approved"
          : isFailed
            ? undefined
            : "Awaiting review...",
    },
    // Step 3: Payment
    {
      label: "Payment",
      status: isFailed
        ? "failed"
        : rank >= 2
          ? "completed"
          : rank === 1
            ? "current"
            : "future",
      meta:
        rank >= 2
          ? order.paidAt
            ? formatDate(order.paidAt)
            : "Paid"
          : rank === 1
            ? "Action required"
            : undefined,
    },
    // Step 4: Shipped
    {
      label: "Shipped",
      status: isFailed
        ? "failed"
        : isCompleted && order.trackingId
          ? "completed"
          : rank >= 2
            ? "current"
            : "future",
      meta:
        order.trackingId
          ? `Tracking: ${order.trackingId}`
          : rank >= 2
            ? "Awaiting shipment..."
            : undefined,
    },
    // Step 5: Delivered
    {
      label: "Delivered",
      status: isCompleted ? "completed" : isFailed ? "failed" : "future",
      meta: isCompleted ? formatDate(order.updatedAt) : undefined,
    },
  ];
}

/* ── Convenience wrappers ── */

export function buildOrderSteps(order: OrderFromAPI): OrderStep[] {
  return order.type === "MINT" ? buildMintSteps(order) : buildRedeemSteps(order);
}

export function getCurrentStepIndex(steps: OrderStep[]): number {
  const idx = steps.findIndex((s) => s.status === "current" || s.status === "failed");
  return idx === -1 ? steps.length - 1 : idx;
}
