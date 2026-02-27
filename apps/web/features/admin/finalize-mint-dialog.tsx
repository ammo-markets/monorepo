"use client";

import { useEffect, useState, useMemo } from "react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFinalizeMint } from "@/hooks/use-finalize-mint";
import { parseContractError } from "@/lib/errors";
import type { Caliber } from "@ammo-exchange/shared";

export interface AdminMintOrder {
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
}

interface FinalizeMintDialogProps {
  order: AdminMintOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinalized: (orderId: string) => void;
}

function formatUsdc(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function FinalizeMintDialog({
  order,
  open,
  onOpenChange,
  onFinalized,
}: FinalizeMintDialogProps) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  const actualPriceX18 = useMemo(() => {
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) return undefined;
    return parseUnits(price, 18);
  }, [price]);

  const {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    isReady,
    reset,
  } = useFinalizeMint(order.caliber as Caliber, {
    orderId: order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined,
    actualPriceX18,
  });

  // React to confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Mint order finalized");
      void queryClient.invalidateQueries({
        queryKey: ["admin", "orders", "MINT"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "stats"],
      });
      onFinalized(order.id);
      onOpenChange(false);
      reset();
      setPrice("");
      setPriceError("");
    }
  }, [isConfirmed, order.id, onFinalized, onOpenChange, reset, queryClient]);

  // React to error
  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  function handleConfirm() {
    // Validate price
    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setPriceError("Enter a valid positive price");
      return;
    }
    setPriceError("");
    write();
  }

  if (!open) return null;

  const buttonLabel = isPending
    ? "Submitting..."
    : isConfirming
      ? "Confirming..."
      : "Finalize Mint";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-6 shadow-2xl"
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
            Finalize Mint Order
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="transition-colors hover:text-[var(--text-primary)]"
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
            <span style={{ color: "var(--text-secondary)" }}>USDC Amount</span>
            <span
              className="font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {formatUsdc(order.usdcAmount ?? "0")} USDC
            </span>
          </div>
        </div>

        {/* Price input */}
        <div className="mt-5">
          <label
            htmlFor="actual-price"
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Actual Price Per Round (USD)
          </label>
          <input
            id="actual-price"
            type="text"
            inputMode="decimal"
            placeholder="0.35"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setPriceError("");
            }}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
            style={{
              borderColor: "var(--border-hover)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          />
          {priceError && (
            <p className="mt-1 text-xs text-red-400">{priceError}</p>
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

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
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
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--brass-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
