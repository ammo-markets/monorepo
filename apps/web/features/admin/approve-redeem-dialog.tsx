"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useApproveRedeem } from "@/hooks/use-approve-redeem";
import { parseContractError } from "@/lib/errors";
import type { Caliber } from "@ammo-exchange/shared";
import { RESTRICTED_STATES } from "@ammo-exchange/shared";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

interface ApproveRedeemDialogProps {
  order: AdminRedeemOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: (orderId: string) => void;
}

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
}

export function ApproveRedeemDialog({
  order,
  open,
  onOpenChange,
  onApproved,
}: ApproveRedeemDialogProps) {
  const queryClient = useQueryClient();
  const [shippingCostInput, setShippingCostInput] = useState("");

  const shippingCostBigInt =
    shippingCostInput && Number(shippingCostInput) >= 0
      ? parseUnits(shippingCostInput, 6)
      : undefined;

  const {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    isReady,
    reset,
  } = useApproveRedeem(order.caliber as Caliber, {
    orderId: order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined,
    shippingCost: shippingCostBigInt,
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Redeem order approved");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("REDEEM"),
      });
      onApproved(order.id);
      onOpenChange(false);
      reset();
      setShippingCostInput("");
    }
  }, [isConfirmed, order.id, onApproved, onOpenChange, reset, queryClient]);

  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  function handleConfirm() {
    if (!shippingCostInput || Number(shippingCostInput) < 0) {
      toast.error("Enter a valid shipping cost");
      return;
    }
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
  if (!order.onChainOrderId) blockReasons.push("On-chain order ID: awaiting");

  const canApprove = blockReasons.length === 0;

  const buttonLabel = isPending
    ? "Submitting..."
    : isConfirming
      ? "Confirming..."
      : "Approve Redeem";

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
            Approve Redeem Order
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
          {hasShipping && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Ship To</span>
              <span
                className="text-right text-xs"
                style={{ color: "var(--text-primary)" }}
              >
                {order.shippingAddress!.name}
                <br />
                {order.shippingAddress!.line1}
                {order.shippingAddress!.line2 && (
                  <>
                    <br />
                    {order.shippingAddress!.line2}
                  </>
                )}
                <br />
                {order.shippingAddress!.city},{" "}
                {order.shippingAddress!.state}{" "}
                {order.shippingAddress!.zip}
              </span>
            </div>
          )}

          <div className="pt-2">
            <label
              htmlFor="shipping-cost"
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Shipping Cost (USDT)
            </label>
            <p
              className="mb-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Enter the shipping cost in USD. Protocol fee is auto-calculated
              on-chain from the oracle price.
            </p>
            <input
              id="shipping-cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 12.50"
              value={shippingCostInput}
              onChange={(e) => setShippingCostInput(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              style={{
                borderColor: "var(--border-hover)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
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

        {!canApprove && (
          <div
            className="mt-4 rounded-lg border px-3 py-2 text-xs"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.08)",
              color: "rgb(239,68,68)",
            }}
          >
            <p className="font-medium">Cannot approve:</p>
            <ul className="mt-1 list-inside list-disc">
              {blockReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
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
            disabled={
              isPending ||
              isConfirming ||
              !isReady ||
              !canApprove ||
              !shippingCostInput
            }
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
