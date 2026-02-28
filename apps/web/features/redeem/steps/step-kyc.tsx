import { Loader2, Shield, Info, Check } from "lucide-react";
import { BackButton, GhostButton } from "@/features/shared";
import { KycForm } from "../kyc-form";
import type { KycFormData } from "../kyc-form";

/* Shield/ID card SVG illustration */
function ShieldIdIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 4L8 16V32C8 46.36 18.56 59.16 32 62C45.44 59.16 56 46.36 56 32V16L32 4Z"
        stroke="var(--brass)"
        strokeWidth="2"
        fill="var(--brass-muted)"
      />
      <rect
        x="18"
        y="22"
        width="28"
        height="20"
        rx="3"
        stroke="var(--brass)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="26"
        cy="30"
        r="3"
        stroke="var(--brass)"
        strokeWidth="1.2"
        fill="none"
      />
      <line
        x1="33"
        y1="28"
        x2="42"
        y2="28"
        stroke="var(--brass)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="33"
        y1="32"
        x2="39"
        y2="32"
        stroke="var(--brass)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M27 37L30 40L37 33"
        stroke="var(--brass)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepKyc({
  kycStatus,
  kycLoading,
  onSubmit,
  kycPrefill,
  onSaveDraft,
  onGoPortfolio,
  onBack,
}: {
  kycStatus: string;
  kycLoading: boolean;
  onSubmit: (data: KycFormData) => Promise<void>;
  kycPrefill?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    state?: string | null;
    govIdType?: string | null;
    govIdNumber?: string | null;
  };
  onSaveDraft: () => void;
  onGoPortfolio: () => void;
  onBack: () => void;
}) {
  /* State A -- Not Verified */
  if (kycStatus === "NONE" || kycStatus === "REJECTED") {
    return (
      <div>
        <BackButton onClick={onBack} />
        <div className="flex flex-col items-center text-center">
          <ShieldIdIcon />
          <h2
            className="mt-5 mb-2 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Identity Verification Required
          </h2>
          <p
            className="mb-6 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Federal law requires identity verification for physical ammunition
            shipment. This is a one-time process.
          </p>

          <KycForm
            onSubmit={onSubmit}
            isSubmitting={kycLoading}
            prefill={kycPrefill}
          />

          <button
            type="button"
            onClick={onSaveDraft}
            className="mt-3 text-sm font-medium transition-none text-text-muted hover:text-text-secondary"
          >
            Save & Continue Later
          </button>
        </div>
      </div>
    );
  }

  /* State B -- Pending */
  if (kycStatus === "PENDING") {
    return (
      <div>
        <BackButton onClick={onBack} />
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
            <span
              className="absolute h-16 w-16 animate-ping rounded-full opacity-25"
              style={{ backgroundColor: "var(--amber)" }}
            />
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(243, 156, 18, 0.15)",
                border: "2px solid var(--amber)",
              }}
            >
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "var(--amber)" }}
              />
            </span>
          </div>

          <h2
            className="mb-2 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Verification In Progress
          </h2>
          <p
            className="mb-6 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Your identity is being reviewed. This usually takes a few minutes to
            a few hours. We'll notify you when approved. You can safely leave
            this page.
          </p>

          <div
            className="mb-6 w-full px-4 py-3.5 text-left"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="flex items-start gap-3">
              <Info
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Your order has been saved as a draft. You can access it anytime
                from your portfolio at /portfolio.
              </p>
            </div>
          </div>

          <GhostButton onClick={onGoPortfolio}>Go to Portfolio</GhostButton>
        </div>
      </div>
    );
  }

  /* State C -- Verified (auto-skip handled in parent, this is the brief flash) */
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(46, 204, 113, 0.15)",
          border: "2px solid var(--green)",
        }}
      >
        <Check size={32} strokeWidth={3} style={{ color: "var(--green)" }} />
      </div>
      <p className="text-lg font-semibold" style={{ color: "var(--green)" }}>
        Identity Verified
      </p>
    </div>
  );
}
