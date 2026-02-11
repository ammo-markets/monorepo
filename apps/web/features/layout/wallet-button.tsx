"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { truncateAddress } from "@/lib/utils";

const USDC_DECIMALS = BigInt(1_000_000);

function formatUsdc(raw: bigint): string {
  const whole = raw / USDC_DECIMALS;
  const frac = raw % USDC_DECIMALS;
  const fracStr = frac.toString().padStart(6, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function WalletButton() {
  const {
    address,
    isConnected,
    isReconnecting,
    isWrongNetwork,
    connect,
    disconnect,
    switchToFuji,
    isConnecting,
    isSwitching,
  } = useWallet();

  const { usdc } = useTokenBalances();

  // During reconnection, render disconnected state to match SSR (prevents hydration mismatch)
  if (isReconnecting || !isConnected) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
        style={{
          backgroundColor: "transparent",
          border: "1px solid var(--border-hover)",
          color: "var(--text-primary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          e.currentTarget.style.borderColor = "var(--brass-border)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "var(--border-hover)";
        }}
        onClick={connect}
        disabled={isConnecting}
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </span>
      </button>
    );
  }

  // State B: Wrong network
  if (isWrongNetwork) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
        style={{
          backgroundColor: "transparent",
          border: "1px solid var(--amber)",
          color: "var(--amber)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={switchToFuji}
        disabled={isSwitching}
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">
          {isSwitching ? "Switching..." : "Switch to Fuji"}
        </span>
      </button>
    );
  }

  // State C: Connected and correct network
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-hover)",
        color: "var(--text-primary)",
      }}
      onClick={disconnect}
    >
      {/* Identicon placeholder */}
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          backgroundColor: "var(--brass-muted)",
          color: "var(--brass)",
        }}
      >
        {address ? address[2]?.toUpperCase() : "?"}
      </span>
      <span className="font-mono text-xs">
        {address ? truncateAddress(address) : ""}
      </span>
      {usdc !== undefined && (
        <span
          className="hidden text-xs sm:inline"
          style={{ color: "var(--text-muted)" }}
        >
          {formatUsdc(usdc)} USDC
        </span>
      )}
    </button>
  );
}
