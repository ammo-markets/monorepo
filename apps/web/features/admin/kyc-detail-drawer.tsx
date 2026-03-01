"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatDate } from "@/lib/utils";
import type { AdminKycUser } from "@/hooks/use-admin-kyc";
import { ApproveKycDialog } from "./approve-kyc-dialog";
import { RejectKycDialog } from "./reject-kyc-dialog";

function KycStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    APPROVED: "bg-green-900/30 text-green-400 border-green-800",
    REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${styles[status] ?? "bg-gray-900/30 text-gray-400 border-gray-800"}`}
    >
      {status}
    </span>
  );
}

const GOV_ID_LABELS: Record<string, string> = {
  DRIVERS_LICENSE: "Driver's License",
  PASSPORT: "Passport",
  STATE_ID: "State ID",
};

interface KycDetailDrawerProps {
  user: AdminKycUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KycDetailDrawer({
  user,
  open,
  onOpenChange,
}: KycDetailDrawerProps) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!user) return null;

  const isPending = user.kycStatus === "PENDING";

  function handleActionDone() {
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="mb-2">
              <KycStatusBadge status={user.kycStatus} />
            </div>
            <SheetTitle>KYC Review</SheetTitle>
            <SheetDescription className="font-mono text-xs break-all">
              {user.walletAddress}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 px-4">
            {/* Identity Details */}
            <div className="space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Identity Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Full Name
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {user.kycFullName ?? "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Date of Birth
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {user.kycDateOfBirth
                      ? new Date(user.kycDateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>State</span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {user.kycState ?? "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    ID Type
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {user.kycGovIdType
                      ? (GOV_ID_LABELS[user.kycGovIdType] ?? user.kycGovIdType)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    ID Number
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.kycGovIdNumber ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Submitted
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.kycSubmittedAt
                      ? formatDate(user.kycSubmittedAt)
                      : "N/A"}
                  </span>
                </div>

                {user.kycReviewedAt && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Reviewed
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatDate(user.kycReviewedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {user.kycRejectionReason && (
              <div className="space-y-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Rejection Reason
                </h3>
                <p
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    backgroundColor: "rgba(231, 76, 60, 0.08)",
                    border: "1px solid rgba(231, 76, 60, 0.2)",
                    color: "var(--text-primary)",
                  }}
                >
                  {user.kycRejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {isPending ? (
            <SheetFooter
              className="flex-row gap-3 border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <button
                type="button"
                onClick={() => setApproveOpen(true)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--brass-hover)]"
                style={{
                  backgroundColor: "var(--brass)",
                  color: "var(--bg-primary)",
                }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="flex-1 rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50"
              >
                Reject
              </button>
            </SheetFooter>
          ) : (
            <SheetFooter
              className="border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{
                  borderColor: "var(--border-hover)",
                  color: "var(--text-primary)",
                }}
              >
                Close
              </button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <ApproveKycDialog
        user={user}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onApproved={handleActionDone}
      />

      <RejectKycDialog
        user={user}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onRejected={handleActionDone}
      />
    </>
  );
}
