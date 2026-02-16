"use client";

import { useState, useEffect, useMemo } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useSearchParams } from "next/navigation";
import { formatUnits } from "viem";
import {
  ArrowLeft,
  Check,
  Lock,
  Wallet,
  Loader2,
  Clock,
  ExternalLink,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData, MarketCaliberFromAPI } from "@/lib/types";
import { CALIBER_SPECS, FEES } from "@ammo-exchange/shared";
import { MintProgress } from "./mint-progress";

import { useWallet } from "@/hooks/use-wallet";
import { useMintTransaction } from "@/hooks/use-mint-transaction";
import { useAllowance } from "@/hooks/use-allowance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { parseContractError } from "@/lib/errors";
import { getDeadline, DEFAULT_SLIPPAGE_BPS, parseUsdc } from "@/lib/tx-utils";
import { snowtraceUrl, truncateAddress } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/* ── Build CaliberDetailData from API market data ── */
function buildCaliberDetail(
  caliber: Caliber,
  market: MarketCaliberFromAPI,
): CaliberDetailData {
  const spec = CALIBER_SPECS[caliber];
  return {
    id: caliber,
    symbol: caliber,
    name: spec.name,
    specLine: spec.description,
    price: market.pricePerRound,
    totalSupply: market.totalSupply,
    mintFee: FEES.MINT_FEE_BPS / 100,
    redeemFee: FEES.REDEEM_FEE_BPS / 100,
    minMint: spec.minMintRounds,
  };
}

function buildAllCaliberDetails(
  marketData: MarketCaliberFromAPI[],
): Record<Caliber, CaliberDetailData> {
  const result = {} as Record<Caliber, CaliberDetailData>;
  for (const m of marketData) {
    result[m.caliber] = buildCaliberDetail(m.caliber, m);
  }
  return result;
}

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

/* ── Transaction Status ── */
type TxStatus =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "approved"
  | "minting"
  | "mint-confirming"
  | "confirmed"
  | "failed";

/* ── Wrong Network Banner ── */
function WrongNetworkBanner({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        border: "1px solid rgba(231, 76, 60, 0.3)",
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} style={{ color: "var(--red)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--red)" }}>
          Please switch to Avalanche to continue
        </span>
      </div>
      <button
        type="button"
        onClick={onSwitch}
        className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: "var(--red)",
          color: "#fff",
        }}
      >
        Switch Network
      </button>
    </div>
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
        className="mb-1 text-xl font-bold"
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
              className="group relative flex flex-col gap-3 rounded-xl p-4 text-left transition-all duration-150"
              style={{
                backgroundColor: isSelected
                  ? "var(--brass-muted)"
                  : "var(--bg-secondary)",
                border: isSelected
                  ? "1.5px solid var(--brass)"
                  : "1.5px solid var(--border-default)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }
              }}
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
                  className="font-mono text-sm font-semibold tabular-nums"
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
        className="mt-6 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
        style={{
          backgroundColor: selected ? "var(--brass)" : "var(--bg-tertiary)",
          color: selected ? "var(--bg-primary)" : "var(--text-muted)",
          cursor: selected ? "pointer" : "not-allowed",
          opacity: selected ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (selected)
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
        }}
        onMouseLeave={(e) => {
          if (selected) e.currentTarget.style.backgroundColor = "var(--brass)";
        }}
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
          className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Selected caliber compact card */}
      <div
        className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <Icon size={28} />
        <div className="flex-1">
          <span
            className="text-sm font-semibold"
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
        className="flex items-center rounded-lg px-4 py-3 transition-colors duration-150"
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
                className="ml-1 font-semibold uppercase transition-colors duration-150"
                style={{ color: "var(--brass)" }}
              >
                MAX
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="font-semibold transition-colors duration-150"
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
            className="flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor:
                usdcAmount === amt.toString()
                  ? "var(--brass-muted)"
                  : "var(--bg-secondary)",
              border:
                usdcAmount === amt.toString()
                  ? "1px solid var(--brass-border)"
                  : "1px solid var(--border-default)",
              color:
                usdcAmount === amt.toString()
                  ? "var(--brass)"
                  : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)";
            }}
            onMouseLeave={(e) => {
              if (usdcAmount !== amt.toString()) {
                e.currentTarget.style.borderColor = "var(--border-default)";
              } else {
                e.currentTarget.style.borderColor = "var(--brass-border)";
              }
            }}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Calculation panel */}
      {usdcValue > 0 && (
        <div
          className="mt-5 rounded-lg px-4 py-4"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>
                Price per round
              </span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                ${caliber.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
              <span
                className="font-mono tabular-nums"
                style={{ color: "var(--text-secondary)" }}
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

      {/* CTA */}
      {!isConnected ? (
        <button
          type="button"
          onClick={onConnect}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-colors duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass)";
          }}
        >
          <Wallet size={16} />
          Connect Wallet to Continue
        </button>
      ) : (
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className="mt-6 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
          style={{
            backgroundColor: isValid ? "var(--brass)" : "var(--bg-tertiary)",
            color: isValid ? "var(--bg-primary)" : "var(--text-muted)",
            cursor: isValid ? "pointer" : "not-allowed",
            opacity: isValid ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (isValid)
              e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            if (isValid)
              e.currentTarget.style.backgroundColor = "var(--brass)";
          }}
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
  txStatus: TxStatus;
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
        className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h2
        className="mb-6 text-xl font-bold"
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
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Tokens to receive
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
          </div>
        </div>
      </div>

      {/* Disclaimer box */}
      <div
        className="mt-4 rounded-lg px-4 py-3.5"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderLeft: "3px solid var(--amber)",
        }}
      >
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Tokens will be minted after physical ammunition is verified in
          storage. This typically takes 24-48 hours. {"You'll"} be able to track
          your order in your portfolio.
        </p>
      </div>

      {/* CTA based on TxStatus */}
      <div className="mt-6">
        {/* Error state */}
        {txStatus === "failed" && (
          <div>
            <div
              className="mb-4 rounded-lg px-4 py-3"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
              style={{
                backgroundColor: "var(--brass)",
                color: "var(--bg-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brass-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brass)";
              }}
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
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass)";
            }}
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        )}

        {/* Connected, idle -- approve step */}
        {txStatus === "idle" && isConnected && (
          <div>
            <button
              type="button"
              onClick={onApprove}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
              style={{
                backgroundColor: "var(--brass)",
                color: "var(--bg-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brass-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--brass)";
              }}
            >
              Approve USDC Spending
            </button>
            <div className="mt-2 flex items-start gap-2 px-1">
              <Info
                size={14}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                This allows the smart contract to use your USDC. You only need
                to do this once.
              </p>
            </div>
          </div>
        )}

        {/* Approving / waiting for approval confirmation */}
        {(txStatus === "approving" || txStatus === "approve-confirming") && (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-muted)",
              cursor: "not-allowed",
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            Approving...
          </button>
        )}

        {/* Approved -- confirm mint */}
        {txStatus === "approved" && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all duration-150"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass)";
            }}
          >
            <Lock size={16} />
            Confirm Mint
          </button>
        )}

        {/* Minting / waiting for mint confirmation */}
        {(txStatus === "minting" || txStatus === "mint-confirming") && (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-muted)",
              cursor: "not-allowed",
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            {"Confirming..."}
          </button>
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
        <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--red)" }}>
          Transaction Failed
        </h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          {errorMessage || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass)";
          }}
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

      <h2 className="mb-1 text-xl font-bold" style={{ color: "var(--brass)" }}>
        Mint Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Your tokens will be delivered to your wallet once the order is
        processed.
      </p>

      {/* Order details card */}
      <div
        className="w-full rounded-xl p-5 text-left"
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
                className="flex items-center gap-1.5 font-mono text-xs font-medium transition-colors duration-150"
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
          className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--brass)";
          }}
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

  const activeCaliber: Caliber = selectedCaliber ?? "9MM";
  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;

  // ── Real hooks ──
  const wallet = useWallet();
  const { usdc: usdcBalanceRaw } = useTokenBalances();
  const mintTx = useMintTransaction(activeCaliber);
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

  // ── Derive TxStatus from hook states ──
  const txStatus: TxStatus = useMemo(() => {
    if (mintTx.isMintConfirmed) return "confirmed";
    if (mintTx.isMintConfirming) return "mint-confirming";
    if (mintTx.isMintPending) return "minting";
    if (
      allowance.hasEnoughAllowance(parseUsdc(usdcAmount || "0")) ||
      mintTx.isApproveConfirmed
    )
      return "approved";
    if (mintTx.isApproveConfirming) return "approve-confirming";
    if (mintTx.isApprovePending) return "approving";
    if (mintTx.approveError || mintTx.mintError) return "failed";
    return "idle";
  }, [
    mintTx.isMintConfirmed,
    mintTx.isMintConfirming,
    mintTx.isMintPending,
    mintTx.isApproveConfirmed,
    mintTx.isApproveConfirming,
    mintTx.isApprovePending,
    mintTx.approveError,
    mintTx.mintError,
    allowance,
    usdcAmount,
  ]);

  const errorMessage = parseContractError(
    mintTx.approveError || mintTx.mintError,
  );

  // ── Auto-advance to confirmation when mint confirmed ──
  useEffect(() => {
    if (mintTx.isMintConfirmed) {
      setStep(3);
    }
  }, [mintTx.isMintConfirmed]);

  // ── Handlers ──
  function handleApprove() {
    mintTx.approve(usdcAmount);
  }

  function handleConfirm() {
    mintTx.startMint(usdcAmount, DEFAULT_SLIPPAGE_BPS, getDeadline());
  }

  function handleRetry() {
    mintTx.reset();
  }

  function handleMintMore() {
    mintTx.reset();
    if (isEmbedded) {
      setStep(1);
      setSelectedCaliber(preselected);
    } else {
      setStep(0);
      setSelectedCaliber(null);
    }
    setUsdcAmount("");
  }

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <MintProgress currentStep={step} />

      {/* Loading skeleton while market data fetches */}
      {marketLoading && (
        <div className="mt-6">
          <div className="mb-6 h-6 w-48 rounded shimmer" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl shimmer" />
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
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
          hideBack={isEmbedded}
          isConnected={wallet.isConnected}
          onConnect={wallet.connect}
        />
      )}

      {step === 2 && caliber && (
        <StepReview
          caliber={caliber}
          usdcAmount={usdcAmount}
          txStatus={txStatus}
          errorMessage={errorMessage}
          isConnected={wallet.isConnected}
          isWrongNetwork={wallet.isWrongNetwork}
          onConnect={wallet.connect}
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
