import { ArrowLeft, Lock, Wallet, Clock, Info } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { WrongNetworkBanner, SpinnerButton } from "@/features/shared";
import type { MintTxStatus } from "@/hooks/use-tx-status";

export function StepReview({
  caliber,
  usdcAmount,
  txStatus,
  errorMessage,
  isConnected,
  isWrongNetwork,
  onConnect,
  onSwitchNetwork,
  onApprove,
  onConfirm,
  onRetry,
  onBack,
}: {
  caliber: CaliberDetailData;
  usdcAmount: string;
  txStatus: MintTxStatus;
  errorMessage: string;
  isConnected: boolean;
  isWrongNetwork: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onApprove: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const usdcValue = Number.parseFloat(usdcAmount) || 0;
  const fee = usdcValue * (caliber.mintFee / 100);
  const netUsdc = usdcValue - fee;
  const estimatedRounds = Math.floor(netUsdc / caliber.price);

  return (
    <div>
      {/* Back */}
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
        Review Your Mint Order
      </h2>

      {/* Wrong network banner */}
      {isWrongNetwork && <WrongNetworkBanner onSwitch={onSwitchNetwork} />}

      {/* Summary card */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1.5px solid var(--border-default)",
        }}
      >
        <div className="flex flex-col gap-4">
          {/* Caliber */}
          <div className="flex items-center gap-3">
            <Icon size={32} />
            <div>
              <div
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {caliber.symbol} — {caliber.name}
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

          {/* Details rows */}
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                USDT to deposit
              </span>
              <span
                className="font-mono font-medium tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {usdcValue.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Mint fee ({caliber.mintFee}%)
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {fee.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="flex items-center gap-1.5 font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Tokens to receive
                <span className="group relative">
                  <Info
                    size={12}
                    className="cursor-help"
                    style={{ color: "var(--text-muted)", opacity: 0.6 }}
                  />
                  <span
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 px-3 py-2 text-xs font-normal leading-relaxed opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Tokens minted instantly at the current oracle price.
                    Estimate based on live price.
                  </span>
                </span>
              </span>
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                ~{estimatedRounds.toLocaleString("en-US")} {caliber.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock size={14} />
                Settlement
              </span>
              <span className="font-medium" style={{ color: "var(--green)" }}>
                Instant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA based on TxStatus */}
      <div className="mt-6">
        {/* Error state */}
        {txStatus === "failed" && (
          <div>
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

        {/* Not connected */}
        {txStatus === "idle" && !isConnected && (
          <button
            type="button"
            onClick={onConnect}
            className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        )}

        {/* Connected, idle -- approve step */}
        {txStatus === "idle" && isConnected && (
          <div className="group relative">
            <button
              type="button"
              onClick={onApprove}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
            >
              Approve USDT Spending
            </button>
            <div
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-xs leading-relaxed opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Allows the smart contract to use your USDT. You only need to do
              this once.
            </div>
          </div>
        )}

        {/* Approving / waiting for approval confirmation */}
        {(txStatus === "approving" || txStatus === "approve-confirming") && (
          <SpinnerButton label="Approving..." />
        )}

        {/* Approved -- confirm mint */}
        {txStatus === "approved" && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 py-4 text-base font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Lock size={16} />
            Confirm Mint
          </button>
        )}

        {/* Minting / waiting for mint confirmation */}
        {(txStatus === "minting" || txStatus === "mint-confirming") && (
          <SpinnerButton label="Confirming..." size="large" />
        )}
      </div>
    </div>
  );
}
