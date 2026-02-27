"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useSearchParams } from "next/navigation";
import { formatUnits } from "viem";
import {
  ArrowLeft,
  Check,
  Lock,
  Wallet,
  Clock,
  ExternalLink,
  XCircle,
  Info,
} from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { buildAllCaliberDetails } from "@/lib/caliber-utils";
import {
  WrongNetworkBanner,
  SpinnerButton,
  DeadlinePicker,
} from "@/features/shared";
import { MintProgress } from "./mint-progress";
import type { MintTxStatus } from "@/hooks/use-tx-status";
import { useTxStatus } from "@/hooks/use-tx-status";

import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMintTransaction } from "@/hooks/use-mint-transaction";
import { useAllowance } from "@/hooks/use-allowance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { parseContractError } from "@/lib/errors";
import { getDeadline, DEFAULT_SLIPPAGE_BPS, parseUsdc } from "@/lib/tx-utils";
import { snowtraceUrl, truncateAddress } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/* ── USDC Icon ── */
function UsdcIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="#3498DB"
        strokeWidth="1.5"
        fill="rgba(52, 152, 219, 0.1)"
      />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="#3498DB"
        fontSize="12"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

/* =====================================================================
   STEP 1 -- SELECT CALIBER
   ===================================================================== */
function StepSelectCaliber({
  selected,
  allCalibers,
  onSelect,
  onNext,
}: {
  selected: Caliber | null;
  allCalibers: CaliberDetailData[];
  onSelect: (id: Caliber) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2
        className="mb-1 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Choose Your Caliber
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Select the ammunition type you want to mint tokens for.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {allCalibers.map((cal) => {
          const isSelected = selected === cal.id;
          const Icon = caliberIcons[cal.id];

          return (
            <button
              key={cal.id}
              type="button"
              onClick={() => onSelect(cal.id)}
              className={`group relative flex flex-col gap-3 p-4 text-left transition-none ${
                isSelected
                  ? "bg-brass-muted border-2 border-brass"
                  : "bg-ax-secondary border-2 border-border-default hover:border-border-hover"
              }`}
            >
              {/* Selected check */}
              {isSelected && (
                <span
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--brass)" }}
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                    style={{ color: "var(--bg-primary)" }}
                  />
                </span>
              )}

              <div className="flex items-center gap-3">
                <Icon size={40} />
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cal.symbol}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {cal.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-sm font-bold uppercase tracking-widest tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${cal.price.toFixed(2)}
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {" "}
                    /round
                  </span>
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Min: {cal.minMint} rounds
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className={`mt-6 flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none ${
          selected
            ? "bg-brass text-ax-primary cursor-pointer hover:bg-brass-hover"
            : "bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
        }`}
      >
        Next
      </button>
    </div>
  );
}

/* =====================================================================
   STEP 2 -- ENTER AMOUNT
   ===================================================================== */
function StepEnterAmount({
  caliber,
  usdcAmount,
  setUsdcAmount,
  usdcBalance,
  deadlineHours,
  onDeadlineChange,
  onNext,
  onBack,
  hideBack,
  isConnected,
  onConnect,
}: {
  caliber: CaliberDetailData;
  usdcAmount: string;
  setUsdcAmount: (val: string) => void;
  usdcBalance: number;
  deadlineHours: number;
  onDeadlineChange: (hours: number) => void;
  onNext: () => void;
  onBack: () => void;
  hideBack?: boolean;
  isConnected: boolean;
  onConnect: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const quickAmounts = [50, 100, 250, 500];
  const usdcValue = Number.parseFloat(usdcAmount) || 0;
  const fee = usdcValue * (caliber.mintFee / 100);
  const netUsdc = usdcValue - fee;
  const estimatedRounds = Math.floor(netUsdc / caliber.price);
  const minUsdcForMinMint = caliber.minMint * caliber.price;
  const belowMinimum = usdcValue > 0 && usdcValue < minUsdcForMinMint;
  const exceedsBalance = usdcValue > usdcBalance;
  const isValid = usdcValue >= minUsdcForMinMint && !exceedsBalance;
  const hasError = belowMinimum || exceedsBalance;

  return (
    <div>
      {/* Back */}
      {!hideBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-none text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Selected caliber compact card */}
      <div
        className="mb-6 flex items-center gap-3 px-4 py-3"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <Icon size={28} />
        <div className="flex-1">
          <span
            className="font-mono text-sm font-bold uppercase tracking-widest"
            style={{ color: "var(--text-primary)" }}
          >
            {caliber.symbol}
          </span>
          <span
            className="text-xs ml-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {caliber.name}
          </span>
        </div>
        <span
          className="font-mono text-sm font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${caliber.price.toFixed(2)}/rd
        </span>
      </div>

      {/* Main USDC input */}
      <label
        className="mb-2 block text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Amount (USDC)
      </label>
      <div
        className="flex items-center px-4 py-3 transition-none"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          border: hasError
            ? "1.5px solid var(--red)"
            : isValid
              ? "1.5px solid var(--green)"
              : "1.5px solid var(--border-default)",
        }}
      >
        <input
          type="number"
          min="0"
          step="0.01"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          placeholder="0.00"
          className="flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums outline-none"
          style={{ color: "var(--text-primary)" }}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <UsdcIcon size={22} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            USDC
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <div>
          {belowMinimum && (
            <p className="text-xs" style={{ color: "var(--red)" }}>
              Minimum mint is {caliber.minMint} rounds (~$
              {minUsdcForMinMint.toFixed(2)} USDC)
            </p>
          )}
          {exceedsBalance && (
            <p className="text-xs" style={{ color: "var(--red)" }}>
              Insufficient USDC balance
            </p>
          )}
          {isValid && (
            <p
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--green)" }}
            >
              <Check size={12} /> Valid amount
            </p>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {isConnected ? (
            <>
              Balance:{" "}
              {usdcBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USDC{" "}
              <button
                type="button"
                onClick={() => setUsdcAmount(usdcBalance.toFixed(2))}
                className="ml-1 font-semibold uppercase transition-none"
                style={{ color: "var(--brass)" }}
              >
                MAX
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="font-semibold transition-none"
              style={{ color: "var(--brass)" }}
            >
              Connect wallet to see balance
            </button>
          )}
        </p>
      </div>

      {/* Quick amount buttons */}
      <div className="mt-4 flex gap-2">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setUsdcAmount(amt.toString())}
            className={`flex-1 py-2 text-sm font-medium transition-none ${
              usdcAmount === amt.toString()
                ? "bg-brass-muted border border-brass-border text-brass"
                : "bg-ax-secondary border border-border-default text-text-secondary hover:border-border-hover"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Calculation panel */}
      {usdcValue > 0 && (
        <div
          className="mt-5 px-4 py-4"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Mint fee ({caliber.mintFee}%)
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                -{fee.toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Net USDC</span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {netUsdc.toFixed(2)} USDC
              </span>
            </div>
            <div
              className="my-0.5"
              style={{ borderTop: "1px solid var(--border-default)" }}
            />
            <div className="flex justify-between">
              <span
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {"You'll receive"}
              </span>
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                ~{estimatedRounds.toLocaleString("en-US")} rounds of{" "}
                {caliber.symbol}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deadline picker */}
      <DeadlinePicker
        deadlineHours={deadlineHours}
        onDeadlineChange={onDeadlineChange}
      />

      {/* CTA */}
      {!isConnected ? (
        <button
          type="button"
          onClick={onConnect}
          className="mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          <Wallet size={16} />
          Connect Wallet to Continue
        </button>
      ) : (
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`mt-6 flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none ${
            isValid
              ? "bg-brass text-ax-primary cursor-pointer hover:bg-brass-hover"
              : "bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          Next
        </button>
      )}
    </div>
  );
}

/* =====================================================================
   STEP 3 -- REVIEW & CONFIRM
   ===================================================================== */
function StepReview({
  caliber,
  usdcAmount,
  deadlineHours,
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
  deadlineHours: number;
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
                USDC to deposit
              </span>
              <span
                className="font-mono font-medium tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {usdcValue.toFixed(2)} USDC
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
                {fee.toFixed(2)} USDC
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
                    Final amount determined by admin at fulfillment based on
                    current market price. Estimate may differ.
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
                Processing time
              </span>
              <span className="font-medium" style={{ color: "var(--amber)" }}>
                24-48 hours
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Order deadline</span>
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
              Approve USDC Spending
            </button>
            <div
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-xs leading-relaxed opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Allows the smart contract to use your USDC. You only need to do
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

/* =====================================================================
   STEP 4 -- CONFIRMATION (Success + Error)
   ===================================================================== */
function StepConfirmation({
  caliber,
  usdcAmount,
  isError,
  errorMessage,
  txHash,
  onMintMore,
  onRetry,
}: {
  caliber: CaliberDetailData;
  usdcAmount: string;
  isError: boolean;
  errorMessage: string;
  txHash: `0x${string}` | undefined;
  onMintMore: () => void;
  onRetry: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const usdcValue = Number.parseFloat(usdcAmount) || 0;
  const fee = usdcValue * (caliber.mintFee / 100);
  const netUsdc = usdcValue - fee;
  const estimatedRounds = Math.floor(netUsdc / caliber.price);

  if (isError) {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Error icon */}
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.15)",
            border: "2px solid var(--red)",
          }}
        >
          <XCircle size={32} style={{ color: "var(--red)" }} />
        </div>
        <h2
          className="mb-2 font-display text-2xl font-bold uppercase"
          style={{ color: "var(--red)" }}
        >
          Transaction Failed
        </h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          {errorMessage || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success icon */}
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--brass-muted)",
          border: "2px solid var(--brass)",
        }}
      >
        <Check size={32} strokeWidth={3} style={{ color: "var(--brass)" }} />
      </div>

      <h2
        className="mb-1 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--brass)" }}
      >
        Mint Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Your tokens will be delivered to your wallet once the order is
        processed.
      </p>

      {/* Order details card */}
      <div
        className="w-full p-5 text-left"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="flex flex-col gap-3 text-sm">
          <div
            className="flex items-center gap-3 pb-3"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            <Icon size={28} />
            <div>
              <div
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                ~{estimatedRounds.toLocaleString("en-US")} {caliber.symbol}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {usdcValue.toFixed(2)} USDC
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Order ID</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Pending indexing
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Transaction</span>
            {txHash ? (
              <a
                href={snowtraceUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs font-medium transition-none"
                style={{ color: "var(--brass)" }}
              >
                {truncateAddress(txHash)}
                <ExternalLink size={12} />
              </a>
            ) : (
              <span
                className="font-mono text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                --
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>
              Estimated delivery
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              24-48 hours
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Status</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: "rgba(243, 156, 18, 0.15)",
                color: "var(--amber)",
              }}
            >
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onMintMore}
          className="flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          Mint More
        </button>
      </div>
    </div>
  );
}

/* =====================================================================
   MAIN ORCHESTRATOR
   ===================================================================== */
export function MintFlow({
  selectedCaliber: caliberFromProp,
}: {
  selectedCaliber?: Caliber;
}) {
  const searchParams = useSearchParams();
  const preselected =
    caliberFromProp ??
    (searchParams.get("caliber")?.toUpperCase() as Caliber | null);
  const isEmbedded = preselected !== null;

  const { data: marketCalibers = [], isLoading: marketLoading } =
    useMarketData();

  const caliberDetailsMap = useMemo(() => {
    if (marketCalibers.length === 0) return null;
    return buildAllCaliberDetails(marketCalibers);
  }, [marketCalibers]);

  const [step, setStep] = useState(() => {
    if (preselected) return 1;
    return 0;
  });
  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(() => {
    if (preselected) return preselected;
    return null;
  });
  const [usdcAmount, setUsdcAmount] = useState("");
  const [deadlineHours, setDeadlineHours] = useState(24);

  const activeCaliber: Caliber = selectedCaliber ?? "9MM";
  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;

  // ── Real hooks ──
  const wallet = useWallet();
  const { openConnectModal } = useConnectModal();
  const { usdc: usdcBalanceRaw } = useTokenBalances();
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[activeCaliber].market;
  const allowance = useAllowance(
    CONTRACT_ADDRESSES.fuji.usdc,
    wallet.address,
    marketAddress,
  );

  // ── Format real USDC balance (6 decimals -> number) ──
  const usdcBalance = useMemo(() => {
    if (usdcBalanceRaw === undefined) return 0;
    return Number(formatUnits(usdcBalanceRaw, 6));
  }, [usdcBalanceRaw]);

  // ── Derive allowance check ──
  const parsedUsdcAmount = useMemo(
    () => parseUsdc(usdcAmount || "0"),
    [usdcAmount],
  );
  const hasEnoughAllowance = allowance.hasEnoughAllowance(parsedUsdcAmount);

  const mintTx = useMintTransaction(
    activeCaliber,
    {
      usdcAmount: parsedUsdcAmount > BigInt(0) ? parsedUsdcAmount : undefined,
      slippageBps: DEFAULT_SLIPPAGE_BPS,
      deadline: getDeadline(deadlineHours),
    },
    { hasEnoughAllowance },
  );

  // ── Derive TxStatus from hook states ──
  const txStatus: MintTxStatus = useTxStatus({
    flags: {
      isActionConfirmed: mintTx.isMintConfirmed,
      isActionConfirming: mintTx.isMintConfirming,
      isActionPending: mintTx.isMintPending,
      isApproveConfirmed: mintTx.isApproveConfirmed,
      isApproveConfirming: mintTx.isApproveConfirming,
      isApprovePending: mintTx.isApprovePending,
      approveError: mintTx.approveError,
      actionError: mintTx.mintError,
      receiptError: mintTx.mintReceiptError ?? mintTx.approveReceiptError,
      simulationError: mintTx.simulationError,
    },
    actionStatus: "minting",
    actionConfirmingStatus: "mint-confirming",
    hasEnoughAllowance,
  });

  const errorMessage = parseContractError(
    mintTx.approveError ||
      mintTx.mintError ||
      mintTx.simulationError ||
      mintTx.mintReceiptError ||
      mintTx.approveReceiptError,
  );

  // ── Auto-advance to confirmation when mint confirmed ──
  useEffect(() => {
    if (mintTx.isMintConfirmed) {
      setStep(3);
    }
  }, [mintTx.isMintConfirmed]);

  // ── Handlers ──
  const handleApprove = useCallback(() => {
    mintTx.approve(usdcAmount);
  }, [mintTx, usdcAmount]);

  const handleConfirm = useCallback(() => {
    mintTx.startMint();
  }, [mintTx]);

  const handleRetry = useCallback(() => {
    mintTx.reset();
  }, [mintTx]);

  const handleMintMore = useCallback(() => {
    mintTx.reset();
    if (isEmbedded) {
      setStep(1);
      setSelectedCaliber(preselected);
    } else {
      setStep(0);
      setSelectedCaliber(null);
    }
    setUsdcAmount("");
    setDeadlineHours(24);
  }, [mintTx, isEmbedded, preselected]);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <MintProgress currentStep={step} />

      {/* Loading skeleton while market data fetches */}
      {marketLoading && (
        <div className="mt-6">
          <div className="mb-6 h-6 w-48 rounded shimmer" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 shimmer" />
            ))}
          </div>
        </div>
      )}

      {step === 0 && !isEmbedded && !marketLoading && (
        <StepSelectCaliber
          selected={selectedCaliber}
          allCalibers={
            caliberDetailsMap ? Object.values(caliberDetailsMap) : []
          }
          onSelect={setSelectedCaliber}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && caliber && (
        <StepEnterAmount
          caliber={caliber}
          usdcAmount={usdcAmount}
          setUsdcAmount={setUsdcAmount}
          usdcBalance={usdcBalance}
          deadlineHours={deadlineHours}
          onDeadlineChange={setDeadlineHours}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
          hideBack={isEmbedded}
          isConnected={wallet.isConnected}
          onConnect={() => openConnectModal?.()}
        />
      )}

      {step === 2 && caliber && (
        <StepReview
          caliber={caliber}
          usdcAmount={usdcAmount}
          deadlineHours={deadlineHours}
          txStatus={txStatus}
          errorMessage={errorMessage}
          isConnected={wallet.isConnected}
          isWrongNetwork={wallet.isWrongNetwork}
          onConnect={() => openConnectModal?.()}
          onSwitchNetwork={wallet.switchToFuji}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && caliber && (
        <StepConfirmation
          caliber={caliber}
          usdcAmount={usdcAmount}
          isError={txStatus === "failed"}
          errorMessage={errorMessage}
          txHash={mintTx.mintHash}
          onMintMore={handleMintMore}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
