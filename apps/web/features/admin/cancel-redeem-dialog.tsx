"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCancelRedeem } from "@/hooks/use-cancel-redeem";
import { useSaveCancelReason } from "@/hooks/use-save-cancel-reason";
import { parseContractError } from "@/lib/errors";
import {
  updateRedeemOrderInCache,
  decrementPendingRedeems,
} from "@/lib/optimistic-updates";
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
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";
import type { Caliber } from "@ammo-exchange/shared";

interface CancelRedeemDialogProps {
  order: AdminRedeemOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: (orderId: string) => void;
}

export function CancelRedeemDialog({
  order,
  open,
  onOpenChange,
  onCancelled,
}: CancelRedeemDialogProps) {
  const queryClient = useQueryClient();
  const saveCancelReason = useSaveCancelReason();
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
  } = useCancelRedeem(order.caliber as Caliber, {
    orderId: order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined,
  });

  // React to confirmation — optimistically update cache, then reconcile via invalidation
  useEffect(() => {
    if (isConfirmed) {
      const trimmed = reason.trim();

      // Cancel in-flight refetches so they don't overwrite our optimistic update
      // before the worker has processed the on-chain event.
      void queryClient.cancelQueries({
        queryKey: queryKeys.admin.orders.all("REDEEM"),
      });
      updateRedeemOrderInCache(queryClient, order.id, {
        status: "CANCELLED",
        cancellationReason: trimmed || null,
        updatedAt: new Date().toISOString(),
      });
      decrementPendingRedeems(queryClient);
      toast.success("Redeem order cancelled");

      if (trimmed) {
        saveCancelReason.mutate({ orderId: order.id, reason: trimmed });
      }
      onCancelled(order.id);
      onOpenChange(false);
      reset();
      setReason("");
      setReasonError("");
    }
  }, [
    isConfirmed,
    order.id,
    onCancelled,
    onOpenChange,
    reset,
    queryClient,
    reason,
    saveCancelReason,
  ]);

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
      : "Cancel Order";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Redeem Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will return the user&apos;s tokens. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="cancel-reason"
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Reason for cancellation
          </label>
          <textarea
            id="cancel-reason"
            rows={3}
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError("");
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
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
