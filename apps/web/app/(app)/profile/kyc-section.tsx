import { Shield, Clock } from "lucide-react";
import { KycForm } from "@/features/redeem/kyc-form";
import type { KycFormData } from "@/features/redeem/kyc-form";

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
}

export function KycSection({
  effectiveKycStatus,
  badge,
  onKycSubmit,
  kycSubmitting,
  kycPrefill,
}: KycSectionProps) {
  return (
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

      {/* Pending state */}
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
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Your identity verification is being reviewed. This usually takes a
            few minutes to a few hours.
          </p>
        </div>
      )}

      {/* KYC form for unverified / rejected users */}
      {(effectiveKycStatus === "NONE" || effectiveKycStatus === "REJECTED") && (
        <div className="mt-4">
          <p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Complete identity verification to enable physical ammunition
            redemption. This is a one-time process.
          </p>
          <KycForm
            onSubmit={onKycSubmit}
            isSubmitting={kycSubmitting}
            prefill={kycPrefill}
          />
        </div>
      )}
    </div>
  );
}
