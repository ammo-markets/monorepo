"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { KycForm } from "@/features/redeem/kyc-form";
import type { KycFormData } from "@/features/redeem/kyc-form";

interface KycPrefill {
  fullName: string | null;
  dateOfBirth: string | null;
  state: string | null;
  govIdType: string | null;
  govIdNumber: string | null;
}

interface KycDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: KycFormData) => Promise<void>;
  isSubmitting: boolean;
  prefill?: KycPrefill;
}

export function KycDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  prefill,
}: KycDialogProps) {
  async function handleSubmit(data: KycFormData) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
          <DialogDescription>
            Complete identity verification to enable physical ammunition
            redemption.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <KycForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            prefill={prefill}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
