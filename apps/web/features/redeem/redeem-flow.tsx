"use client";

import type { ReactNode } from "react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useSearchParams } from "next/navigation";
import { formatUnits } from "viem";
import {
  Check,
  Lock,
  Wallet,
  Loader2,
  ExternalLink,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  Clock,
  Package,
  MapPin,
  Flame,
  Truck,
} from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { buildAllCaliberDetails } from "@/lib/caliber-utils";
import {
  BackButton,
  PrimaryButton,
  GhostButton,
  SpinnerButton,
} from "@/features/shared";
import { RedeemProgress } from "./redeem-progress";
import type { RedeemTxStatus } from "@/hooks/use-tx-status";
import { useTxStatus } from "@/hooks/use-tx-status";
import { KycForm } from "./kyc-form";
import type { KycFormData } from "./kyc-form";

import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRedeemTransaction } from "@/hooks/use-redeem-transaction";
import { useAllowance } from "@/hooks/use-allowance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useKycStatus, useKycSubmit } from "@/hooks/use-kyc";
import { parseContractError } from "@/lib/errors";
import { getDeadline, parseTokenAmount } from "@/lib/tx-utils";
import { snowtraceUrl, truncateAddress } from "@/lib/utils";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/* ── US States ── */
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const RESTRICTED_STATES = ["CA", "NY", "IL", "DC", "NJ"];

/* ── Types ── */
interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

/* ── Form field ── */
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-1.5 flex items-baseline gap-1 text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {!required && (
          <span
            className="normal-case tracking-normal"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          >
            Optional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ======================================================================
   STEP 1 -- SELECT CALIBER & AMOUNT
   ====================================================================== */
function StepSelectCaliberAmount({
  selectedCaliber,
  roundsAmount,
  tokenBalances,
  caliberDetailsMap,
  onSelectCaliber,
  setRoundsAmount,
  onNext,
  isEmbedded,
  isConnected,
  onConnect,
}: {
  selectedCaliber: Caliber | null;
  roundsAmount: string;
  tokenBalances: Record<Caliber, bigint | undefined>;
  caliberDetailsMap: Record<Caliber, CaliberDetailData> | null;
  onSelectCaliber: (id: Caliber) => void;
  setRoundsAmount: (v: string) => void;
  onNext: () => void;
  isEmbedded?: boolean;
  isConnected: boolean;
  onConnect: () => void;
}) {
  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;
  const estValue = netRounds * (caliber?.price ?? 0);
  const minRedeem = caliber ? caliber.minMint : 50;

  // Real on-chain balance for selected caliber (18 decimals -> number)
  const balance = useMemo(() => {
    if (!selectedCaliber) return 0;
    const raw = tokenBalances[selectedCaliber];
    if (raw === undefined) return 0;
    return Number(formatUnits(raw, 18));
  }, [selectedCaliber, tokenBalances]);

  const belowMin = rounds > 0 && rounds < minRedeem;
  const exceedsBalance = rounds > balance;
  const isValid = rounds >= minRedeem && !exceedsBalance;
  const hasError = belowMin || exceedsBalance;

  const allCalibers = caliberDetailsMap ? Object.values(caliberDetailsMap) : [];

  return (
    <div>
      {!isEmbedded && (
        <>
          <h2
            className="mb-1 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Select Caliber & Amount
          </h2>
          <p
            className="mb-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Choose the token to redeem for physical ammunition delivery.
          </p>

          {/* Caliber card selector */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allCalibers.map((cal) => {
              const isSelected = selectedCaliber === cal.id;
              const Icon = caliberIcons[cal.id];
              const calBalance = tokenBalances[cal.id];
              const displayBalance = !isConnected
                ? "—"
                : calBalance !== undefined
                  ? Math.floor(
                      Number(formatUnits(calBalance, 18)),
                    ).toLocaleString("en-US")
                  : "...";
              return (
                <button
                  key={cal.id}
                  type="button"
                  onClick={() => onSelectCaliber(cal.id)}
                  className={`group relative flex flex-col gap-3 p-4 text-left transition-none ${
                    isSelected
                      ? "bg-brass-muted border-2 border-brass"
                      : "bg-ax-secondary border-2 border-border-default hover:border-border-hover"
                  }`}
                >
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
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Balance:{" "}
                      <span
                        className="font-mono font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {displayBalance}
                      </span>
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Min: {cal.minMint} rds
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {isEmbedded && (
        <>
          <h2
            className="mb-1 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Enter Amount
          </h2>
          <p
            className="mb-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter the number of rounds to redeem.
          </p>
        </>
      )}

      {/* Amount input -- only shows when caliber selected */}
      {caliber && (
        <>
          <div className="mt-6">
            <label
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Rounds to Redeem
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
                step="1"
                value={roundsAmount}
                onChange={(e) => setRoundsAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = caliberIcons[caliber.id];
                  return <Icon size={22} />;
                })()}
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {caliber.symbol}
                </span>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <div>
                {belowMin && (
                  <p className="text-xs" style={{ color: "var(--red)" }}>
                    Minimum redeem is {minRedeem} rounds
                  </p>
                )}
                {exceedsBalance && (
                  <p className="text-xs" style={{ color: "var(--red)" }}>
                    Insufficient token balance
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
                Balance: {Math.floor(balance).toLocaleString("en-US")}{" "}
                {caliber.symbol}{" "}
                <button
                  type="button"
                  onClick={() =>
                    setRoundsAmount(Math.floor(balance).toString())
                  }
                  className="ml-1 font-semibold uppercase transition-none"
                  style={{ color: "var(--brass)" }}
                >
                  MAX
                </button>
              </p>
            </div>
          </div>

          {/* Calculation panel */}
          {rounds > 0 && (
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
                    Tokens to burn
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
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
                    -{fee} rounds
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Net rounds for shipment
                  </span>
                  <span
                    className="font-mono font-medium tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {netRounds.toLocaleString("en-US")} rounds
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
                    Estimated value
                  </span>
                  <span
                    className="font-mono font-bold tabular-nums"
                    style={{ color: "var(--brass)" }}
                  >
                    ~${estValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
        <PrimaryButton disabled={!isValid} onClick={onNext}>
          Next
        </PrimaryButton>
      )}
    </div>
  );
}

/* ======================================================================
   STEP 2 -- SHIPPING INFORMATION
   ====================================================================== */
function StepShipping({
  address,
  setAddress,
  ageVerified,
  setAgeVerified,
  caliber,
  onNext,
  onBack,
}: {
  address: ShippingAddress;
  setAddress: (a: ShippingAddress) => void;
  ageVerified: boolean;
  setAgeVerified: (v: boolean) => void;
  caliber: CaliberDetailData;
  onNext: () => void;
  onBack: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isRestricted = RESTRICTED_STATES.includes(address.state);
  const restrictedStateName =
    US_STATES.find((s) => s.value === address.state)?.label ?? address.state;

  const zipValid = /^\d{5}$/.test(address.zip);
  const formComplete =
    address.fullName.trim() !== "" &&
    address.address1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.state !== "" &&
    zipValid &&
    ageVerified &&
    !isRestricted;

  const update = (field: keyof ShippingAddress, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const inputStyle = (hasValue: boolean) => ({
    backgroundColor: "var(--bg-tertiary)",
    border: `1.5px solid ${hasValue ? "var(--border-hover)" : "var(--border-default)"}`,
    color: "var(--text-primary)",
  });

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm font-medium outline-none transition-none placeholder:font-normal";

  return (
    <div>
      <BackButton onClick={onBack} />

      <h2
        className="mb-1 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Shipping Information
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Enter the delivery address for your physical ammunition.
      </p>

      {/* Info / restricted banner */}
      {isRestricted ? (
        <div
          className="mb-6 flex gap-3 px-4 py-4"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.08)",
            borderLeft: "3px solid var(--red)",
          }}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--red)" }}
          />
          <div>
            <p
              className="font-mono text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--red)" }}
            >
              Direct shipping is not available in {restrictedStateName}.
            </p>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Ammunition must be shipped to a licensed dealer. Contact support
              for dealer pickup options.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="mb-6 flex gap-3 px-4 py-4"
          style={{
            backgroundColor: "rgba(243, 156, 18, 0.08)",
            borderLeft: "3px solid var(--amber)",
          }}
        >
          <Truck
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--amber)" }}
          />
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Physical ammunition ships via UPS Ground to eligible U.S. addresses
            only.
          </p>
        </div>
      )}

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <FormField label="Full Name" required>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="John Doe"
            className={inputClass}
            style={inputStyle(address.fullName.trim() !== "")}
          />
        </FormField>

        <FormField label="Address Line 1" required>
          <input
            type="text"
            value={address.address1}
            onChange={(e) => update("address1", e.target.value)}
            placeholder="123 Main Street"
            className={inputClass}
            style={inputStyle(address.address1.trim() !== "")}
          />
        </FormField>

        <FormField label="Address Line 2">
          <input
            type="text"
            value={address.address2}
            onChange={(e) => update("address2", e.target.value)}
            placeholder="Apt, Suite, Unit"
            className={inputClass}
            style={inputStyle(address.address2.trim() !== "")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <FormField label="City" required>
            <input
              type="text"
              value={address.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Austin"
              className={inputClass}
              style={inputStyle(address.city.trim() !== "")}
            />
          </FormField>

          <FormField label="State" required>
            <select
              value={address.state}
              onChange={(e) => update("state", e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
              style={{
                ...inputStyle(address.state !== ""),
                color:
                  address.state === ""
                    ? "var(--text-muted)"
                    : "var(--text-primary)",
              }}
            >
              <option value="">Select</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="ZIP Code"
            required
            error={
              address.zip !== "" && !zipValid ? "Enter 5-digit ZIP" : undefined
            }
          >
            <input
              type="text"
              maxLength={5}
              value={address.zip}
              onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
              placeholder="78701"
              className={inputClass}
              style={inputStyle(address.zip.trim() !== "")}
            />
          </FormField>
        </div>
      </div>

      {/* Age verification checkbox */}
      <div
        className="mt-6 flex gap-3 px-4 py-3.5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <input
          type="checkbox"
          id="age-verify"
          checked={ageVerified}
          onChange={(e) => setAgeVerified(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-brass"
        />
        <label
          htmlFor="age-verify"
          className="cursor-pointer text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          I confirm I am 21 years or older (handgun ammunition) / 18 years or
          older (rifle/shotgun ammunition) and legally eligible to receive
          ammunition in my state.
        </label>
      </div>

      {saveError && (
        <p className="mt-2 text-xs" style={{ color: "var(--red)" }}>
          {saveError}
        </p>
      )}

      <PrimaryButton
        disabled={!formComplete || isSaving}
        onClick={async () => {
          setIsSaving(true);
          setSaveError(null);
          try {
            const res = await fetch("/api/users/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                defaultShippingName: address.fullName,
                defaultShippingLine1: address.address1,
                defaultShippingLine2: address.address2 || null,
                defaultShippingCity: address.city,
                defaultShippingState: address.state,
                defaultShippingZip: address.zip,
              }),
            });
            if (!res.ok) {
              throw new Error("Failed to save shipping address");
            }
            onNext();
          } catch {
            setSaveError("Failed to save shipping address. Please try again.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        {isSaving ? "Saving..." : "Next"}
      </PrimaryButton>
    </div>
  );
}

/* ======================================================================
   STEP 3 -- KYC VERIFICATION
   ====================================================================== */

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
      {/* Shield outline */}
      <path
        d="M32 4L8 16V32C8 46.36 18.56 59.16 32 62C45.44 59.16 56 46.36 56 32V16L32 4Z"
        stroke="var(--brass)"
        strokeWidth="2"
        fill="var(--brass-muted)"
      />
      {/* ID card inside */}
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
      {/* Avatar circle */}
      <circle
        cx="26"
        cy="30"
        r="3"
        stroke="var(--brass)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* ID text lines */}
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
      {/* Check on shield */}
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

function StepKyc({
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
          {/* Pulsing spinner */}
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
            {
              "Your identity is being reviewed. This usually takes a few minutes to a few hours. We'll notify you when approved. You can safely leave this page."
            }
          </p>

          {/* Draft info card */}
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

/* ======================================================================
   STEP 4 -- REVIEW & CONFIRM
   ====================================================================== */
function StepReview({
  caliber,
  roundsAmount,
  address,
  txStatus,
  errorMessage,
  isConnected,
  hasEnoughAllowance,
  onConnect,
  onApprove,
  onConfirm,
  onRetry,
  onBack,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  address: ShippingAddress;
  txStatus: RedeemTxStatus;
  errorMessage: string;
  isConnected: boolean;
  hasEnoughAllowance: boolean;
  onConnect: () => void;
  onApprove: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;
  const stateName =
    US_STATES.find((s) => s.value === address.state)?.label ?? address.state;

  return (
    <div>
      <BackButton onClick={onBack} />

      <h2
        className="mb-6 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Review Your Redemption
      </h2>

      {/* Summary card */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1.5px solid var(--border-default)",
        }}
      >
        <div className="flex flex-col gap-4">
          {/* Caliber header */}
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

            <div
              className="my-0.5"
              style={{ borderTop: "1px solid var(--border-default)" }}
            />

            {/* Ship to */}
            <div className="flex items-start justify-between">
              <span
                className="flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <MapPin size={14} /> Ship to
              </span>
              <div
                className="text-right text-xs leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                <div className="font-medium">{address.fullName}</div>
                <div style={{ color: "var(--text-secondary)" }}>
                  {address.address1}
                </div>
                {address.address2 && (
                  <div style={{ color: "var(--text-secondary)" }}>
                    {address.address2}
                  </div>
                )}
                <div style={{ color: "var(--text-secondary)" }}>
                  {address.city}, {address.state} {address.zip}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Truck size={14} /> Est. shipping
              </span>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                5-10 business days
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Shipping cost</span>
              <span className="font-medium" style={{ color: "var(--green)" }}>
                Included in fee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Serious disclaimer */}
      <div
        className="mt-4 px-4 py-3.5"
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
            <Wallet size={16} /> Connect Wallet
          </button>
        )}

        {/* Connected, idle, allowance NOT sufficient -- approve step */}
        {txStatus === "idle" && isConnected && !hasEnoughAllowance && (
          <div>
            <button
              type="button"
              onClick={onApprove}
              className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
            >
              Approve Token Spending
            </button>
            <div className="mt-2 flex items-start gap-2 px-1">
              <Info
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                This allows the smart contract to burn your tokens. You only
                need to do this once per caliber.
              </p>
            </div>
          </div>
        )}

        {/* Connected, idle, allowance sufficient -- skip to confirm */}
        {txStatus === "idle" && isConnected && hasEnoughAllowance && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 py-4 text-base font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Lock size={16} /> Confirm Redemption
          </button>
        )}

        {/* Approving / waiting for approval confirmation */}
        {(txStatus === "approving" || txStatus === "approve-confirming") && (
          <SpinnerButton label="Approving..." />
        )}

        {/* Approved -- confirm redemption */}
        {txStatus === "approved" && (
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 py-4 text-base font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
          >
            <Lock size={16} /> Confirm Redemption
          </button>
        )}

        {/* Redeeming / waiting for confirmation */}
        {(txStatus === "redeeming" || txStatus === "redeem-confirming") && (
          <SpinnerButton label="Burning tokens..." size="large" />
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   STEP 5 -- CONFIRMATION
   ====================================================================== */
function StepConfirmation({
  caliber,
  roundsAmount,
  isError,
  errorMessage,
  redeemHash,
  onRedeemMore,
  onRetry,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  isError: boolean;
  errorMessage?: string;
  redeemHash: `0x${string}` | undefined;
  onRedeemMore: () => void;
  onRetry: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;

  if (isError) {
    return (
      <div className="flex flex-col items-center text-center">
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
        <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>
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
        Redemption Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        {
          "Your tokens have been burned. You'll receive a tracking number via email once your order ships."
        }
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
                {netRounds.toLocaleString("en-US")} rounds shipping
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {rounds.toLocaleString("en-US")} {caliber.symbol} burned
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
            {redeemHash ? (
              <a
                href={snowtraceUrl(redeemHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs font-medium transition-none"
                style={{ color: "var(--brass)" }}
              >
                {truncateAddress(redeemHash)}
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
            <span style={{ color: "var(--text-muted)" }}>Tokens burned</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {rounds.toLocaleString("en-US")} {caliber.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Rounds shipping</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {netRounds.toLocaleString("en-US")}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>
              Estimated delivery
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              5-10 business days
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
              Processing
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex w-full flex-col gap-3">
        <GhostButton onClick={onRedeemMore}>Redeem More</GhostButton>
      </div>
    </div>
  );
}

/* ======================================================================
   MAIN ORCHESTRATOR
   ====================================================================== */
export function RedeemFlow({
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

  const [step, setStep] = useState(0);
  const [showKycPrompt, setShowKycPrompt] = useState(false);
  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(() => {
    if (preselected) return preselected;
    return null;
  });
  const [roundsAmount, setRoundsAmount] = useState("");
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
  });
  const [ageVerified, setAgeVerified] = useState(false);

  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;

  // ── Real hooks ──
  const activeCaliber: Caliber = selectedCaliber ?? "9MM";
  const wallet = useWallet();
  const { openConnectModal } = useConnectModal();
  const balances = useTokenBalances();

  // ── KYC hooks ──
  const { data: kycData, isLoading: kycLoading } = useKycStatus(wallet.address);
  const kycStatus = kycData?.kycStatus ?? "NONE";
  const kycPrefill = kycData?.kycPrefill;
  const { mutateAsync: submitKyc, isPending: kycSubmitting } = useKycSubmit();
  // Show KYC prompt upfront for unverified users once data loads
  useEffect(() => {
    if (
      wallet.isConnected &&
      !kycLoading &&
      kycData &&
      (kycStatus === "NONE" || kycStatus === "REJECTED")
    ) {
      setShowKycPrompt(true);
    }
  }, [wallet.isConnected, kycLoading, kycData, kycStatus]);

  const tokenAddress = CONTRACT_ADDRESSES.fuji.calibers[activeCaliber].token;
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[activeCaliber].market;
  const allowance = useAllowance(tokenAddress, wallet.address, marketAddress);

  // ── Derive allowance check ──
  const parsedTokenAmount = useMemo(
    () => (roundsAmount ? parseTokenAmount(roundsAmount) : BigInt(0)),
    [roundsAmount],
  );
  const hasEnoughAllowance = roundsAmount
    ? allowance.hasEnoughAllowance(parsedTokenAmount)
    : false;

  const redeemTx = useRedeemTransaction(
    activeCaliber,
    {
      tokenAmount:
        parsedTokenAmount > BigInt(0) ? parsedTokenAmount : undefined,
      deadline: getDeadline(),
    },
    { hasEnoughAllowance },
  );

  // ── Derive TxStatus from hook states ──
  const txStatus: RedeemTxStatus = useTxStatus({
    flags: {
      isActionConfirmed: redeemTx.isRedeemConfirmed,
      isActionConfirming: redeemTx.isRedeemConfirming,
      isActionPending: redeemTx.isRedeemPending,
      isApproveConfirmed: redeemTx.isApproveConfirmed,
      isApproveConfirming: redeemTx.isApproveConfirming,
      isApprovePending: redeemTx.isApprovePending,
      approveError: redeemTx.approveError,
      actionError: redeemTx.redeemError,
      receiptError: redeemTx.redeemReceiptError ?? redeemTx.approveReceiptError,
      simulationError: redeemTx.simulationError,
    },
    actionStatus: "redeeming",
    actionConfirmingStatus: "redeem-confirming",
    hasEnoughAllowance,
  });

  const errorMessage = parseContractError(
    redeemTx.approveError ||
      redeemTx.redeemError ||
      redeemTx.simulationError ||
      redeemTx.redeemReceiptError ||
      redeemTx.approveReceiptError,
  );

  // ── Auto-advance to confirmation when redeem confirmed ──
  useEffect(() => {
    if (redeemTx.isRedeemConfirmed) {
      setStep(4);
    }
  }, [redeemTx.isRedeemConfirmed]);

  // Handle KYC auto-skip for verified users
  const kycAutoSkipRef = useRef(false);
  useEffect(() => {
    if (step === 2 && kycStatus === "APPROVED" && !kycAutoSkipRef.current) {
      kycAutoSkipRef.current = true;
      const timer = window.setTimeout(() => {
        setStep(3);
      }, 800); // brief flash
      return () => clearTimeout(timer);
    }
  }, [step, kycStatus]);

  const handleKycSubmit = useCallback(
    async (data: KycFormData) => {
      await submitKyc(data);
    },
    [submitKyc],
  );

  // ── Handlers ──
  function handleApprove() {
    redeemTx.approve(roundsAmount);
  }

  function handleConfirm() {
    redeemTx.startRedeem();
  }

  function handleRetry() {
    redeemTx.reset();
  }

  const handleRedeemMore = useCallback(() => {
    redeemTx.reset();
    setStep(0);
    if (isEmbedded) {
      setSelectedCaliber(preselected);
    } else {
      setSelectedCaliber(null);
    }
    setRoundsAmount("");
    setAddress({
      fullName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
    });
    setAgeVerified(false);
    setShowKycPrompt(false);
    kycAutoSkipRef.current = false;
  }, [redeemTx, isEmbedded, preselected]);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <RedeemProgress currentStep={step} />

      {/* Loading skeleton while market data fetches */}
      {marketLoading && (
        <div className="mt-6">
          <div className="mb-6 h-6 w-52 rounded shimmer" />
          <div className="h-4 w-72 rounded shimmer mb-6" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 shimmer" />
            ))}
          </div>
        </div>
      )}

      {/* KYC pre-check banner for unverified users */}
      {step === 0 && !marketLoading && showKycPrompt && wallet.isConnected && (
        <div
          className="mb-6 px-5 py-5"
          style={{
            backgroundColor: "rgba(243, 156, 18, 0.08)",
            border: "1.5px solid var(--amber)",
          }}
        >
          <div className="flex gap-3">
            <Shield
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--amber)" }}
            />
            <div className="flex-1">
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Identity Verification Required
              </h3>
              <p
                className="mt-1.5 text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                You must complete KYC verification before redeeming tokens for
                physical delivery. This is a one-time process required by
                federal law.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/profile#kyc"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
                >
                  <Shield size={14} />
                  Complete Verification
                </a>
                <button
                  type="button"
                  onClick={() => setShowKycPrompt(false)}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold transition-none bg-transparent border border-border-hover text-text-primary hover:bg-ax-tertiary hover:border-brass-border"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 0 && !marketLoading && (
        <StepSelectCaliberAmount
          selectedCaliber={selectedCaliber}
          roundsAmount={roundsAmount}
          tokenBalances={balances.tokens}
          caliberDetailsMap={caliberDetailsMap}
          onSelectCaliber={setSelectedCaliber}
          setRoundsAmount={setRoundsAmount}
          onNext={() => {
            // Block progression if KYC not started/approved
            if (kycStatus !== "APPROVED" && kycStatus !== "PENDING") {
              setShowKycPrompt(true);
              return;
            }
            setStep(1);
          }}
          isEmbedded={isEmbedded}
          isConnected={wallet.isConnected}
          onConnect={() => openConnectModal?.()}
        />
      )}

      {step === 1 && caliber && (
        <StepShipping
          address={address}
          setAddress={setAddress}
          ageVerified={ageVerified}
          setAgeVerified={setAgeVerified}
          caliber={caliber}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <StepKyc
          kycStatus={kycStatus}
          kycLoading={kycSubmitting}
          onSubmit={handleKycSubmit}
          kycPrefill={kycPrefill}
          onSaveDraft={() => {
            window.location.href = "/portfolio";
          }}
          onGoPortfolio={() => {
            window.location.href = "/portfolio";
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && caliber && (
        <StepReview
          caliber={caliber}
          roundsAmount={roundsAmount}
          address={address}
          txStatus={txStatus}
          errorMessage={errorMessage}
          isConnected={wallet.isConnected}
          hasEnoughAllowance={hasEnoughAllowance}
          onConnect={() => openConnectModal?.()}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
          onBack={() => {
            setStep(2);
            kycAutoSkipRef.current = false;
          }}
        />
      )}

      {step === 4 && caliber && (
        <StepConfirmation
          caliber={caliber}
          roundsAmount={roundsAmount}
          isError={txStatus === "failed"}
          errorMessage={errorMessage}
          redeemHash={redeemTx.redeemHash}
          onRedeemMore={handleRedeemMore}
          onRetry={() => {
            redeemTx.reset();
            setStep(3);
          }}
        />
      )}
    </div>
  );
}
