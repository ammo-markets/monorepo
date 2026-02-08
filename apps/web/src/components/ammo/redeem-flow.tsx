"use client";

import React from "react";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
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
import { caliberIcons } from "./caliber-icons";
import {
  caliberDetails,
  type CaliberId,
  type CaliberDetailData,
} from "@/lib/mock-data";
import { RedeemProgress } from "./redeem-progress";

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
type WalletState =
  | "disconnected"
  | "connected"
  | "burning"
  | "success"
  | "failed";
type KycStatus = "not_verified" | "pending" | "verified";

interface ShippingAddress {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

/* ── Shared back button ── */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  );
}

/* ── Primary button helper ── */
function PrimaryButton({
  disabled,
  onClick,
  children,
  icon,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
      style={{
        backgroundColor: disabled ? "var(--bg-tertiary)" : "var(--brass)",
        color: disabled ? "var(--text-muted)" : "var(--bg-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.backgroundColor = "var(--brass-hover)";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = "var(--brass)";
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/* ── Ghost button helper ── */
function GhostButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
      style={{
        backgroundColor: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--border-hover)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
        e.currentTarget.style.borderColor = "var(--brass-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
    >
      {children}
    </button>
  );
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
  children: React.ReactNode;
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

/* ══════════════════════════════════════════
   STEP 1 — SELECT CALIBER & AMOUNT
   ══════════════════════════════════════════ */
function StepSelectCaliberAmount({
  selectedCaliber,
  roundsAmount,
  onSelectCaliber,
  setRoundsAmount,
  onNext,
}: {
  selectedCaliber: CaliberId | null;
  roundsAmount: string;
  onSelectCaliber: (id: CaliberId) => void;
  setRoundsAmount: (v: string) => void;
  onNext: () => void;
}) {
  const caliber = selectedCaliber ? caliberDetails[selectedCaliber] : null;
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;
  const estValue = netRounds * (caliber?.price ?? 0);
  const minRedeem = caliber ? caliber.minMint : 50;
  const balance = caliber?.userTokenBalance ?? 0;
  const belowMin = rounds > 0 && rounds < minRedeem;
  const exceedsBalance = rounds > balance;
  const isValid = rounds >= minRedeem && !exceedsBalance;
  const hasError = belowMin || exceedsBalance;

  const allCalibers = Object.values(caliberDetails);

  return (
    <div>
      <h2
        className="mb-1 text-xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Select Caliber & Amount
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Choose the token to redeem for physical ammunition delivery.
      </p>

      {/* Caliber card selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {allCalibers.map((cal) => {
          const isSelected = selectedCaliber === cal.id;
          const Icon = caliberIcons[cal.id];
          return (
            <button
              key={cal.id}
              type="button"
              onClick={() => onSelectCaliber(cal.id)}
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
                if (!isSelected)
                  e.currentTarget.style.borderColor = "var(--border-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = isSelected
                    ? "var(--brass)"
                    : "var(--border-default)";
              }}
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
                    {cal.userTokenBalance.toLocaleString("en-US")}
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

      {/* Amount input — only shows when caliber selected */}
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
                Balance: {balance.toLocaleString("en-US")} {caliber.symbol}{" "}
                <button
                  type="button"
                  onClick={() => setRoundsAmount(balance.toString())}
                  className="ml-1 font-semibold uppercase transition-colors duration-150"
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
              className="mt-5 rounded-lg px-4 py-4"
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

      <PrimaryButton disabled={!isValid} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 2 — SHIPPING INFORMATION
   ══════════════════════════════════════════ */
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
    "w-full rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none transition-colors duration-150 placeholder:font-normal";

  return (
    <div>
      <BackButton onClick={onBack} />

      <h2
        className="mb-1 text-xl font-bold"
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
          className="mb-6 flex gap-3 rounded-xl px-4 py-4"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.08)",
            borderLeft: "3px solid var(--red)",
          }}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 flex-shrink-0"
            style={{ color: "var(--red)" }}
          />
          <div>
            <p
              className="text-sm font-semibold"
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
          className="mb-6 flex gap-3 rounded-xl px-4 py-4"
          style={{
            backgroundColor: "rgba(243, 156, 18, 0.08)",
            borderLeft: "3px solid var(--amber)",
          }}
        >
          <Truck
            size={18}
            className="mt-0.5 flex-shrink-0"
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
        className="mt-6 flex gap-3 rounded-lg px-4 py-3.5"
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
          className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded accent-[var(--brass)]"
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

      <PrimaryButton disabled={!formComplete} onClick={onNext}>
        Next
      </PrimaryButton>
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 3 — KYC VERIFICATION
   ══════════════════════════════════════════ */

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
  onVerify,
  onSaveDraft,
  onGoPortfolio,
  onBack,
}: {
  kycStatus: KycStatus;
  onVerify: () => void;
  onSaveDraft: () => void;
  onGoPortfolio: () => void;
  onBack: () => void;
}) {
  /* State A — Not Verified */
  if (kycStatus === "not_verified") {
    return (
      <div>
        <BackButton onClick={onBack} />
        <div className="flex flex-col items-center text-center">
          <ShieldIdIcon />
          <h2
            className="mt-5 mb-2 text-xl font-bold"
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

          {/* Bullet points */}
          <div
            className="mb-6 w-full rounded-lg px-5 py-4 text-left"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <ul className="flex flex-col gap-3">
              {[
                {
                  icon: <Shield size={14} />,
                  text: "Government-issued photo ID",
                },
                { icon: <Clock size={14} />, text: "Takes 2-5 minutes" },
                {
                  icon: <Check size={14} />,
                  text: "Verified by Persona (third-party)",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "var(--brass-muted)",
                      color: "var(--brass)",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <PrimaryButton onClick={onVerify} icon={<Shield size={16} />}>
            Verify My Identity
          </PrimaryButton>
          <button
            type="button"
            onClick={onSaveDraft}
            className="mt-3 text-sm font-medium transition-colors duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            Save & Continue Later
          </button>
        </div>
      </div>
    );
  }

  /* State B — Pending */
  if (kycStatus === "pending") {
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
            className="mb-2 text-xl font-bold"
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
            className="mb-6 w-full rounded-lg px-4 py-3.5 text-left"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="flex items-start gap-3">
              <Info
                size={16}
                className="mt-0.5 flex-shrink-0"
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

  /* State C — Verified (auto-skip handled in parent, this is the brief flash) */
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

/* ══════════════════════════════════════════
   STEP 4 — REVIEW & CONFIRM
   ══════════════════════════════════════════ */
function StepReview({
  caliber,
  roundsAmount,
  address,
  walletState,
  onConnect,
  onConfirm,
  onBack,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  address: ShippingAddress;
  walletState: WalletState;
  onConnect: () => void;
  onConfirm: () => void;
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
        className="mb-6 text-xl font-bold"
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
        className="mt-4 rounded-lg px-4 py-3.5"
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

      {/* Wallet CTA */}
      <div className="mt-6">
        {walletState === "disconnected" && (
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
            <Wallet size={16} /> Connect Wallet
          </button>
        )}

        {walletState === "connected" && (
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
            <Lock size={16} /> Confirm Redemption
          </button>
        )}

        {walletState === "burning" && (
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
            <Loader2 size={16} className="animate-spin" /> Burning tokens...
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STEP 5 — CONFIRMATION
   ══════════════════════════════════════════ */
function StepConfirmation({
  caliber,
  roundsAmount,
  isError,
  errorMessage,
  onTrackOrder,
  onRedeemMore,
  onRetry,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  isError: boolean;
  errorMessage?: string;
  onTrackOrder: () => void;
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
        <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--red)" }}>
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

      <h2 className="mb-1 text-xl font-bold" style={{ color: "var(--brass)" }}>
        Redemption Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        {
          "Your tokens have been burned. You'll receive a tracking number via email once your order ships."
        }
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
              style={{ color: "var(--text-primary)" }}
            >
              #AMX-R-2024-015
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Transaction</span>
            <a
              href="#"
              className="flex items-center gap-1.5 font-mono text-xs font-medium transition-colors duration-150"
              style={{ color: "var(--brass)" }}
            >
              0x7e3f...a1b9
              <ExternalLink size={12} />
            </a>
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
        <PrimaryButton onClick={onTrackOrder} icon={<Package size={16} />}>
          Track Order
        </PrimaryButton>
        <GhostButton onClick={onRedeemMore}>Redeem More</GhostButton>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN ORCHESTRATOR
   ══════════════════════════════════════════ */
export function RedeemFlow() {
  const searchParams = useSearchParams();
  const preselected = searchParams
    .get("caliber")
    ?.toUpperCase() as CaliberId | null;

  const [step, setStep] = useState(() => {
    if (preselected && caliberDetails[preselected]) return 0;
    return 0;
  });
  const [selectedCaliber, setSelectedCaliber] = useState<CaliberId | null>(
    () => {
      if (preselected && caliberDetails[preselected]) return preselected;
      return null;
    },
  );
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

  // KYC — for demo purposes, default to "not_verified".
  // Toggle to "verified" to see auto-skip behavior.
  const [kycStatus, setKycStatus] = useState<KycStatus>("not_verified");

  const [walletState, setWalletState] = useState<WalletState>("disconnected");
  const [txError, setTxError] = useState(false);
  const [txErrorMessage, setTxErrorMessage] = useState("");

  const caliber = selectedCaliber ? caliberDetails[selectedCaliber] : null;

  // Handle KYC auto-skip for verified users
  const kycAutoSkipRef = useRef(false);
  useEffect(() => {
    if (step === 2 && kycStatus === "verified" && !kycAutoSkipRef.current) {
      kycAutoSkipRef.current = true;
      const timer = setTimeout(() => {
        setStep(3);
      }, 800); // brief flash
      return () => clearTimeout(timer);
    }
  }, [step, kycStatus]);

  const handleKycVerify = useCallback(() => {
    // Simulate starting verification, then goes to pending
    setKycStatus("pending");
    // After a few seconds, auto-approve for demo
    setTimeout(() => {
      setKycStatus("verified");
    }, 4000);
  }, []);

  const handleConnect = useCallback(() => {
    setWalletState("connected");
  }, []);

  const handleConfirmBurn = useCallback(() => {
    setWalletState("burning");
    setTimeout(() => {
      const success = Math.random() > 0.15;
      if (success) {
        setWalletState("success");
        setStep(4);
      } else {
        setTxError(true);
        setTxErrorMessage(
          "Transaction reverted: burn amount exceeds balance. Please try again.",
        );
        setStep(4);
      }
    }, 3000);
  }, []);

  const handleRedeemMore = useCallback(() => {
    setStep(0);
    setSelectedCaliber(null);
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
    setWalletState("disconnected");
    setTxError(false);
    setTxErrorMessage("");
    kycAutoSkipRef.current = false;
  }, []);

  const handleRetry = useCallback(() => {
    setTxError(false);
    setTxErrorMessage("");
    setStep(3);
    setWalletState("connected");
  }, []);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12">
      <RedeemProgress currentStep={step} />

      {step === 0 && (
        <StepSelectCaliberAmount
          selectedCaliber={selectedCaliber}
          roundsAmount={roundsAmount}
          onSelectCaliber={setSelectedCaliber}
          setRoundsAmount={setRoundsAmount}
          onNext={() => setStep(1)}
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
          onVerify={handleKycVerify}
          onSaveDraft={() => {
            // Would save draft and navigate
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
          walletState={walletState}
          onConnect={handleConnect}
          onConfirm={handleConfirmBurn}
          onBack={() => {
            setStep(2);
            setWalletState("disconnected");
            kycAutoSkipRef.current = false;
          }}
        />
      )}

      {step === 4 && caliber && (
        <StepConfirmation
          caliber={caliber}
          roundsAmount={roundsAmount}
          isError={txError}
          errorMessage={txErrorMessage}
          onTrackOrder={() => {
            window.location.href = "/portfolio/orders/AMX-R-2024-015";
          }}
          onRedeemMore={handleRedeemMore}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
