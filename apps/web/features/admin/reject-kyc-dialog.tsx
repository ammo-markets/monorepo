"use client";

import { useState } from "react";
import { toast } from "sonner";
import { truncateAddress } from "@/lib/utils";
import { useAdminKycAction } from "@/hooks/use-admin-kyc";
import type { AdminKycUser } from "@/hooks/use-admin-kyc";
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

interface RejectKycDialogProps {
  user: AdminKycUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
}

export function RejectKycDialog({
  user,
  open,
  onOpenChange,
  onRejected,
}: RejectKycDialogProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const { mutateAsync, isPending } = useAdminKycAction();

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();

    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("A rejection reason is required");
      return;
    }
    setReasonError("");

    try {
      await mutateAsync({
        userId: user.id,
        action: "REJECT",
        rejectionReason: trimmed,
      });
      toast.success("KYC rejected");
      onOpenChange(false);
      setReason("");
      onRejected();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject KYC",
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject KYC?</AlertDialogTitle>
          <AlertDialogDescription>
            Reject identity verification for{" "}
            <span className="font-semibold">
              {user.kycFullName ?? "Unknown"}
            </span>{" "}
            ({truncateAddress(user.walletAddress)}). The user will be able to
            resubmit.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="kyc-reject-reason"
            className="block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Reason for rejection
          </label>
          <textarea
            id="kyc-reject-reason"
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

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? "Rejecting..." : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
