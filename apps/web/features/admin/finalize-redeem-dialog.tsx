"use client";

import { useEffect, useState } from "react";
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
  shippingCost: string | null;
  protocolFee: string | null;
  trackingId: string | null;
  paidAt: string | null;
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

function formatUsdtAmount(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function FinalizeRedeemDialog({
  order,
  open,
  onOpenChange,
  onFinalized,
}: FinalizeRedeemDialogProps) {
  const queryClient = useQueryClient();
  const [trackingInput, setTrackingInput] = useState(order.trackingId ?? "");
  const [savingTracking, setSavingTracking] = useState(false);

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

  async function handleSaveTracking() {
    if (!trackingInput.trim()) return;
    setSavingTracking(true);
    try {
      const res = await fetch("/api/admin/orders/tracking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          trackingId: trackingInput.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to save tracking ID");
      } else {
        toast.success("Tracking ID saved");
        void queryClient.invalidateQueries({
          queryKey: queryKeys.admin.orders.all("REDEEM"),
        });
      }
    } catch {
      toast.error("Failed to save tracking ID");
    } finally {
      setSavingTracking(false);
    }
  }

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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

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
          {order.shippingCost && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Shipping Paid</span>
              <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                ${formatUsdtAmount(order.shippingCost)}
              </span>
            </div>
          )}
          {order.protocolFee && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Protocol Fee Paid</span>
              <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                ${formatUsdtAmount(order.protocolFee)}
              </span>
            </div>
          )}
          {order.shippingAddress && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Ship To</span>
              <span
                className="text-right text-xs"
                style={{ color: "var(--text-primary)" }}
              >
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
            </div>
          )}

          {/* Tracking ID input */}
          <div className="pt-2">
            <label
              htmlFor="tracking-id"
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              UPS Tracking ID
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="tracking-id"
                type="text"
                placeholder="1Z999AA10123456784"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
                style={{
                  borderColor: "var(--border-hover)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                disabled={savingTracking || !trackingInput.trim()}
                onClick={handleSaveTracking}
                className="rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "var(--border-hover)",
                  color: "var(--text-primary)",
                }}
              >
                {savingTracking ? "Saving..." : "Save"}
              </button>
            </div>
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
