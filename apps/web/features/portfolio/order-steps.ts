import type { OrderFromAPI, OrderStep } from "@/lib/types";
import { truncateAddress, snowtraceUrl, formatDate } from "@/lib/utils";

/* ── Step builders ── */

export function buildMintSteps(order: OrderFromAPI): OrderStep[] {
  const isCompleted = order.status === "COMPLETED";
  const isFailed = order.status === "FAILED" || order.status === "CANCELLED";
  return [
    {
      label: "Tokens Minted",
      status: isCompleted ? "completed" : isFailed ? "failed" : "current",
      meta: order.txHash ? `Tx: ${truncateAddress(order.txHash)}` : undefined,
      link: order.txHash
        ? { url: snowtraceUrl(order.txHash), label: "View on Snowtrace" }
        : undefined,
    },
    {
      label: "Completed",
      status: isCompleted ? "completed" : isFailed ? "failed" : "future",
      meta: isCompleted ? formatDate(order.updatedAt) : undefined,
    },
  ];
}

export function buildRedeemSteps(order: OrderFromAPI): OrderStep[] {
  const isProcessing = order.status === "PROCESSING";
  const isShipped = order.status === "COMPLETED";
  const isFailed = order.status === "FAILED" || order.status === "CANCELLED";
  return [
    {
      label: "Redeem Requested",
      status: "completed",
      meta: formatDate(order.createdAt),
    },
    {
      label: "Tokens Burned",
      status:
        isProcessing || isShipped
          ? "completed"
          : isFailed
            ? "failed"
            : "current",
      meta: order.txHash
        ? `Tx: ${truncateAddress(order.txHash)}`
        : "Awaiting confirmation...",
      link: order.txHash
        ? { url: snowtraceUrl(order.txHash), label: "View on Snowtrace" }
        : undefined,
    },
    {
      label: "Shipped",
      status: isShipped
        ? "completed"
        : isFailed
          ? "failed"
          : isProcessing
            ? "current"
            : "future",
      meta: isShipped
        ? (order.trackingId ?? formatDate(order.updatedAt))
        : isProcessing
          ? "Awaiting shipment..."
          : undefined,
    },
  ];
}

/* ── Convenience wrappers ── */

export function buildOrderSteps(order: OrderFromAPI): OrderStep[] {
  return order.type === "MINT"
    ? buildMintSteps(order)
    : buildRedeemSteps(order);
}

export function getCurrentStepIndex(steps: OrderStep[]): number {
  const idx = steps.findIndex(
    (s) => s.status === "current" || s.status === "failed",
  );
  return idx === -1 ? steps.length - 1 : idx;
}
