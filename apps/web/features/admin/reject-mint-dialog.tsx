"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useRefundMint } from "@/hooks/use-refund-mint";
import { parseContractError } from "@/lib/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminMintOrder } from "./finalize-mint-dialog";
import type { Caliber } from "@ammo-exchange/shared";

interface RejectMintDialogProps {
  order: AdminMintOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: (orderId: string) => void;
}

export function RejectMintDialog({
  order,
  open,
  onOpenChange,
  onRejected,
}: RejectMintDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const {
    write,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    isReady,
    reset,
  } = useRefundMint(order.caliber as Caliber, {
    orderId: order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined,
  });

  // React to confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Mint order rejected");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("MINT"),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats.all,
      });
      onRejected(order.id);
      onOpenChange(false);
      reset();
      setReason("");
      setReasonError("");
    }
  }, [isConfirmed, order.id, onRejected, onOpenChange, reset, queryClient]);

  // React to error
  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  function handleConfirm(e: React.MouseEvent) {
    e.preventDefault(); // Keep dialog open during async tx flow

    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("A reason is required");
      return;
    }
    setReasonError("");

    write();
  }

  const buttonLabel = isPending
    ? "Submitting..."
    : isConfirming
      ? "Confirming..."
      : "Reject Order";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Mint Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will refund the user&apos;s USDC. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="reject-reason"
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Reason for rejection
          </label>
          <textarea
            id="reject-reason"
            rows={3}
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError("");
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
            style={{
              borderColor: reasonError
                ? "rgb(248 113 113)"
                : "var(--border-hover)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          />
          {reasonError && <p className="text-xs text-red-400">{reasonError}</p>}
        </div>

        {hash && (
          <p
            className="break-all text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Tx: {hash}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending || isConfirming || !isReady}
            onClick={handleConfirm}
          >
            {buttonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
