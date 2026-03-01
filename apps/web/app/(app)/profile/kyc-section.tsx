"use client";

import { useState } from "react";
import { Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { KycFormData } from "@/features/redeem/kyc-form";
import { KycDialog } from "./kyc-dialog";

interface KycPrefill {
  fullName: string | null;
  dateOfBirth: string | null;
  state: string | null;
  govIdType: string | null;
  govIdNumber: string | null;
}

interface KycSectionProps {
  effectiveKycStatus: string;
  badge: { label: string; bg: string; color: string };
  onKycSubmit: (data: KycFormData) => Promise<void>;
  kycSubmitting: boolean;
  kycPrefill?: KycPrefill;
  rejectionReason?: string | null;
  submittedAt?: string | null;
}

export function KycSection({
  effectiveKycStatus,
  badge,
  onKycSubmit,
  kycSubmitting,
  kycPrefill,
  rejectionReason,
  submittedAt,
}: KycSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div
        id="kyc"
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Shield size={16} style={{ color: "var(--text-muted)" }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Identity Verification
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>

        {/* NONE state */}
        {effectiveKycStatus === "NONE" && (
          <div className="mt-4">
            <p
              className="mb-4 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Complete identity verification to enable physical ammunition
              redemption. This is a one-time process.
            </p>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--brass-hover)]"
              style={{
                backgroundColor: "var(--brass)",
                color: "var(--bg-primary)",
              }}
            >
              Start Verification
            </button>
          </div>
        )}

        {/* PENDING state */}
        {effectiveKycStatus === "PENDING" && (
          <div
            className="mt-4 flex gap-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: "rgba(243, 156, 18, 0.08)",
              border: "1px solid rgba(243, 156, 18, 0.2)",
            }}
          >
            <Clock
              size={16}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "var(--amber)" }}
            />
            <div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Your identity verification is being reviewed. This usually takes
                a few minutes to a few hours.
              </p>
              {submittedAt && (
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Submitted {new Date(submittedAt).toLocaleDateString()} at{" "}
                  {new Date(submittedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* APPROVED state */}
        {effectiveKycStatus === "APPROVED" && (
          <div
            className="mt-4 flex gap-3 rounded-lg px-4 py-3"
            style={{
              backgroundColor: "rgba(46, 204, 113, 0.08)",
              border: "1px solid rgba(46, 204, 113, 0.2)",
            }}
          >
            <CheckCircle2
              size={16}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "var(--green)" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Identity verified. You can redeem tokens for physical ammunition.
            </p>
          </div>
        )}

        {/* REJECTED state */}
        {effectiveKycStatus === "REJECTED" && (
          <div className="mt-4 space-y-3">
            <div
              className="flex gap-3 rounded-lg px-4 py-3"
              style={{
                backgroundColor: "rgba(231, 76, 60, 0.08)",
                border: "1px solid rgba(231, 76, 60, 0.2)",
              }}
            >
              <XCircle
                size={16}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "var(--red)" }}
              />
              <div>
                <p
                  className="text-xs font-medium leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Your verification was rejected.
                </p>
                {rejectionReason && (
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Reason: {rejectionReason}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--brass-hover)]"
              style={{
                backgroundColor: "var(--brass)",
                color: "var(--bg-primary)",
              }}
            >
              Resubmit Verification
            </button>
          </div>
        )}
      </div>

      <KycDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onKycSubmit}
        isSubmitting={kycSubmitting}
        prefill={kycPrefill}
      />
    </>
  );
}
