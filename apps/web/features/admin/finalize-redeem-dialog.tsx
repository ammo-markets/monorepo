"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useFinalizeRedeem } from "@/hooks/use-finalize-redeem";
import { parseContractError } from "@/lib/errors";
import {
  updateRedeemOrderInCache,
  decrementPendingRedeems,
} from "@/lib/optimistic-updates";
import type { Caliber } from "@ammo-exchange/shared";
import { RESTRICTED_STATES } from "@ammo-exchange/shared";

export interface AdminRedeemOrder {
  id: string;
  walletAddress: string | null;
  caliber: string;
  usdcAmount: string | null;
  tokenAmount: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  onChainOrderId: string | null;
  txHash: string | null;
  trackingId: string | null;
  cancellationReason: string | null;
  shippingAddress: {
    id: string;
    orderId: string;
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    zip: string;
  } | null;
}

interface FinalizeRedeemDialogProps {
  order: AdminRedeemOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinalized: (orderId: string) => void;
}

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
}

export function FinalizeRedeemDialog({
  order,
  open,
  onOpenChange,
  onFinalized,
}: FinalizeRedeemDialogProps) {
  const queryClient = useQueryClient();
  const {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    isReady,
    reset,
  } = useFinalizeRedeem(order.caliber as Caliber, {
    orderId: order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined,
  });

  // React to confirmation — optimistically update cache, then reconcile via invalidation
  useEffect(() => {
    if (isConfirmed) {
      // Cancel in-flight refetches so they don't overwrite our optimistic update
      // before the worker has processed the on-chain event.
      void queryClient.cancelQueries({
        queryKey: queryKeys.admin.orders.all("REDEEM"),
      });
      updateRedeemOrderInCache(queryClient, order.id, {
        status: "PROCESSING",
        updatedAt: new Date().toISOString(),
      });
      decrementPendingRedeems(queryClient);
      toast.success("Redeem order finalized");
      onFinalized(order.id);
      onOpenChange(false);
      reset();
    }
  }, [isConfirmed, order.id, onFinalized, onOpenChange, reset, queryClient]);

  // React to error
  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  function handleConfirm() {
    write();
  }

  if (!open) return null;

  const hasShipping = !!order.shippingAddress;
  const isRestrictedState =
    hasShipping &&
    (RESTRICTED_STATES as readonly string[]).includes(
      order.shippingAddress!.state,
    );

  const blockReasons: string[] = [];
  if (!hasShipping) blockReasons.push("No shipping address on file");
  if (isRestrictedState)
    blockReasons.push(
      `Shipping to ${order.shippingAddress!.state} is restricted`,
    );

  const canFinalize = blockReasons.length === 0;

  const buttonLabel = isPending
    ? "Submitting..."
    : isConfirming
      ? "Confirming..."
      : "Finalize Redeem";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-6 shadow-xl"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Finalize Redeem Order
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="transition-colors hover:text-text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Order ID</span>
            <span
              className="font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {order.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Wallet</span>
            <span
              className="font-mono text-xs"
              style={{ color: "var(--text-primary)" }}
            >
              {order.walletAddress ?? "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Caliber</span>
            <span style={{ color: "var(--text-primary)" }}>
              {order.caliber}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Token Amount</span>
            <span
              className="font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {formatTokenAmount(order.tokenAmount ?? "0")} rounds
            </span>
          </div>
          {order.shippingAddress ? (
            <div>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Ship To
              </span>
              <div
                className="mt-1 rounded-lg border p-3 text-xs leading-relaxed"
                style={{
                  borderColor: "var(--border-default)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
              <span style={{ color: "var(--text-primary)" }}>None</span>
            </div>
          )}
        </div>

        {hash && (
          <p
            className="mt-3 break-all text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Tx: {hash}
          </p>
        )}

        {!canFinalize && (
          <div
            className="mt-4 rounded-lg border px-3 py-2 text-xs"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.08)",
              color: "rgb(239,68,68)",
            }}
          >
            <p className="font-medium">Cannot finalize:</p>
            <ul className="mt-1 list-inside list-disc">
              {blockReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-ax-tertiary"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || isConfirming || !isReady || !canFinalize}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
