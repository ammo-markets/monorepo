"use client";

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

interface ApproveKycDialogProps {
  user: AdminKycUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
}

export function ApproveKycDialog({
  user,
  open,
  onOpenChange,
  onApproved,
}: ApproveKycDialogProps) {
  const { mutateAsync, isPending } = useAdminKycAction();

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await mutateAsync({ userId: user.id, action: "APPROVE" });
      toast.success("KYC approved");
      onOpenChange(false);
      onApproved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve KYC",
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve KYC?</AlertDialogTitle>
          <AlertDialogDescription>
            Approve identity verification for{" "}
            <span className="font-semibold">
              {user.kycFullName ?? "Unknown"}
            </span>{" "}
            ({truncateAddress(user.walletAddress)}). This will allow the user to
            redeem tokens.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
