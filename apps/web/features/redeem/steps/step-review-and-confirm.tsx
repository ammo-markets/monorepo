import {
  ArrowLeft,
  Lock,
  Wallet,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { SpinnerButton } from "@/features/shared";
import type { RedeemTxStatus } from "@/hooks/use-tx-status";
import type { ShippingAddress } from "./step-shipping";

export function StepReviewAndConfirm({
  caliber,
  roundsAmount,
  address,
  hasAddress,
  kycStatus,
  deadlineHours,
  txStatus,
  errorMessage,
  isConnected,
  hasEnoughAllowance,
  onConnect,
  onApprove,
  onConfirm,
  onRetry,
  onBack,
  onGoToShipping,
  onGoToKyc,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  address: ShippingAddress;
  hasAddress: boolean;
  kycStatus: string;
  deadlineHours: number;
  txStatus: RedeemTxStatus;
  errorMessage: string;
  isConnected: boolean;
  hasEnoughAllowance: boolean;
  onConnect: () => void;
  onApprove: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
  onGoToShipping: () => void;
  onGoToKyc: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;

  const kycApproved = kycStatus === "APPROVED";
  const canProceed = isConnected && kycApproved && hasAddress;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-none text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h2
        className="mb-6 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Review Your Redemption
      </h2>

      {/* Summary card */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1.5px solid var(--border-default)",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Icon size={32} />
            <div>
              <div
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {caliber.symbol} -- {caliber.name}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {caliber.specLine}
              </div>
            </div>
          </div>

          <div
            className="my-0.5"
            style={{ borderTop: "1px solid var(--border-default)" }}
          />

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Tokens to burn</span>
              <span
                className="font-mono font-medium tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {rounds.toLocaleString("en-US")} {caliber.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Redeem fee (1.5%)
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {fee} rounds
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Net rounds shipped
              </span>
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                {netRounds.toLocaleString("en-US")} rounds
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Order expiry</span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {deadlineHours === 0 ? "None" : `${deadlineHours} hours`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Gating / Requirements Panel */}
      <div className="mb-6">
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Requirements
        </h3>
        <div className="flex flex-col gap-2">
          {/* Identity Verification */}
          <div
            className="flex items-center justify-between p-3 rounded-lg border border-border-default"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <div className="flex items-center gap-3">
              {kycApproved ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <AlertCircle size={18} className="text-ammo-amber" />
              )}
              <div className="flex flex-col">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Identity Verification
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {kycApproved
                    ? "Verified"
                    : kycStatus === "PENDING"
                      ? "Review in progress"
                      : "Required by federal law"}
                </span>
              </div>
            </div>
            {!kycApproved && (
              <button
                type="button"
                onClick={onGoToKyc}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-border-hover transition-colors hover:bg-bg-secondary"
                style={{ color: "var(--text-primary)" }}
              >
                {kycStatus === "PENDING" ? "View Status" : "Verify"}
              </button>
            )}
          </div>

          {/* Shipping Address */}
          <div
            className="flex items-center justify-between p-3 rounded-lg border border-border-default"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <div className="flex items-center gap-3">
              {hasAddress ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <AlertCircle size={18} className="text-ammo-amber" />
              )}
              <div className="flex flex-col">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Shipping Address
                </span>
                <span
                  className="text-xs truncate max-w-[150px] sm:max-w-[200px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {hasAddress
                    ? `${address.city}, ${address.state} ${address.zip}`
                    : "Where should we send it?"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToShipping}
              className="text-xs font-semibold px-3 py-1.5 rounded-md border border-border-hover transition-colors hover:bg-bg-secondary"
              style={{ color: "var(--text-primary)" }}
            >
              {hasAddress ? "Edit" : "Add Address"}
            </button>
          </div>
        </div>
      </div>

      {canProceed && (
        <div
          className="mb-6 px-4 py-3.5"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderLeft: "3px solid var(--red)",
          }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Once confirmed,{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {rounds.toLocaleString("en-US")} {caliber.symbol} tokens will be
              permanently burned
            </strong>{" "}
            and cannot be recovered. Physical ammunition will be shipped to the
            address above. Please verify all details before confirming.
          </p>
        </div>
      )}

      {/* CTA based on TxStatus */}
      <div>
        {txStatus === "failed" && (
          <div className="mb-4">
            <div
              className="mb-4 px-4 py-3"
              style={{
                backgroundColor: "rgba(231, 76, 60, 0.1)",
                border: "1px solid rgba(231, 76, 60, 0.3)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--red)" }}>
                {errorMessage || "An unexpected error occurred."}
              </p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
            >
              Try Again
            </button>
          </div>
        )}

        {!isConnected ? (
          <button
            type="button"
            onClick={onConnect}
            className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Wallet size={16} /> Connect Wallet
          </button>
        ) : !canProceed ? (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
          >
            Complete Requirements to Continue
          </button>
        ) : txStatus === "idle" && !hasEnoughAllowance ? (
          <div className="group relative">
            <button
              type="button"
              onClick={onApprove}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
            >
              Approve Token Spending
            </button>
            <div
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-xs leading-relaxed opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Allows the smart contract to burn your tokens. You only need to do
              this once per caliber.
            </div>
          </div>
        ) : txStatus === "idle" && hasEnoughAllowance ? (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 py-4 text-base font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Lock size={16} /> Confirm Redemption
          </button>
        ) : txStatus === "approving" || txStatus === "approve-confirming" ? (
          <SpinnerButton label="Approving..." />
        ) : txStatus === "approved" ? (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 py-4 text-base font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Lock size={16} /> Confirm Redemption
          </button>
        ) : txStatus === "redeeming" || txStatus === "redeem-confirming" ? (
          <SpinnerButton label="Burning tokens..." size="large" />
        ) : null}
      </div>
    </div>
  );
}
