"use client";

import { useEffect, useState } from "react";
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
  amount: string;
  createdAt: string;
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

  const { finalizeMint, hash, error, isPending, isConfirming, isConfirmed, reset } =
    useFinalizeMint(order.caliber as Caliber);

  // React to confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Mint order finalized");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
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

    const actualPriceX18 = parseUnits(price, 18);
    finalizeMint(BigInt(order.onChainOrderId!), actualPriceX18);
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
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            Finalize Mint Order
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
            <span className="text-zinc-400">USDC Amount</span>
            <span className="font-mono text-zinc-200">
              {formatUsdc(order.amount)} USDC
            </span>
          </div>
        </div>

        {/* Price input */}
        <div className="mt-5">
          <label
            htmlFor="actual-price"
            className="block text-sm font-medium text-zinc-300"
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
            className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {priceError && (
            <p className="mt-1 text-xs text-red-400">{priceError}</p>
          )}
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
