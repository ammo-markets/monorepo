"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useFinalizeRedeem } from "@/hooks/use-finalize-redeem";
import { parseContractError } from "@/lib/errors";
import type { Caliber } from "@ammo-exchange/shared";

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
  user: { kycStatus: string; kycFullName: string | null; kycState: string | null } | null;
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

const KYC_COLORS: Record<string, { bg: string; text: string }> = {
  APPROVED: { bg: "rgba(34,197,94,0.15)", text: "rgb(34,197,94)" },
  PENDING: { bg: "rgba(234,179,8,0.15)", text: "rgb(234,179,8)" },
  REJECTED: { bg: "rgba(239,68,68,0.15)", text: "rgb(239,68,68)" },
  NONE: { bg: "rgba(148,163,184,0.15)", text: "rgb(148,163,184)" },
};

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

  // React to confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Redeem order finalized");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("REDEEM"),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats.all,
      });
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
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--text-secondary)" }}>KYC Status</span>
            <span className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: KYC_COLORS[order.user?.kycStatus ?? "NONE"]?.bg,
                  color: KYC_COLORS[order.user?.kycStatus ?? "NONE"]?.text,
                }}
              >
                {order.user?.kycStatus ?? "NONE"}
              </span>
              {order.user?.kycFullName && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {order.user.kycFullName}{order.user.kycState ? ` (${order.user.kycState})` : ""}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
            <span style={{ color: "var(--text-primary)" }}>
              {order.shippingAddress
                ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                : "None"}
            </span>
          </div>
        </div>

        {hash && (
          <p
            className="mt-3 break-all text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Tx: {hash}
          </p>
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
            disabled={isPending || isConfirming || !isReady}
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
