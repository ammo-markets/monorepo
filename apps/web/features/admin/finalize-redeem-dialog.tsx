"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFinalizeRedeem } from "@/hooks/use-finalize-redeem";
import { parseContractError } from "@/lib/errors";
import type { Caliber } from "@ammo-exchange/shared";

export interface AdminRedeemOrder {
  id: string;
  walletAddress: string | null;
  caliber: string;
  amount: string;
  createdAt: string;
  onChainOrderId: string | null;
  txHash: string | null;
  user: { kycStatus: string } | null;
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
  const { finalizeRedeem, hash, error, isPending, isConfirming, isConfirmed, reset } =
    useFinalizeRedeem(order.caliber as Caliber);

  // React to confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Redeem order finalized");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
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
    finalizeRedeem(BigInt(order.onChainOrderId!));
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            Finalize Redeem Order
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Order ID</span>
            <span className="font-mono text-zinc-200">
              {order.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Wallet</span>
            <span className="font-mono text-xs text-zinc-200">
              {order.walletAddress ?? "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Caliber</span>
            <span className="text-zinc-200">{order.caliber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Token Amount</span>
            <span className="font-mono text-zinc-200">
              {formatTokenAmount(order.amount)} rounds
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">KYC Status</span>
            <span className="text-zinc-200">
              {order.user?.kycStatus ?? "NONE"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Shipping</span>
            <span className="text-zinc-200">
              {order.shippingAddress
                ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                : "None"}
            </span>
          </div>
        </div>

        {hash && (
          <p className="mt-3 break-all text-xs text-zinc-500">
            Tx: {hash}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || isConfirming}
            className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
