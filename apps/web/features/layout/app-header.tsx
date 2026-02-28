"use client";

import { useBalance } from "wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { formatUnits } from "viem";
import { isTestnet, activeChain } from "@/lib/chain";
import { AmmoLogo } from "./logo";
import { WalletButton, formatUsdc } from "./wallet-button";
import { UsdcIcon } from "./usdc-icon";
import { FaucetButtons } from "./faucet-buttons";

function formatAvax(value: bigint): string {
  const formatted = formatUnits(value, 18);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.001) return "<0.001";
  return num.toFixed(3);
}

export function AppHeader() {
  const { isConnected, isReconnecting, isWrongNetwork, address } = useWallet();
  const { usdc } = useTokenBalances();

  const { data: avaxBalance } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  });

  const networkLabel = activeChain.name;
  const dotColor =
    isConnected && !isReconnecting && isWrongNetwork
      ? "var(--amber)"
      : "var(--green)";

  return (
    <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-ax-secondary lg:left-60 px-4 sm:px-6">
      {/* Mobile: show logo (sidebar is hidden). Desktop: empty spacer */}
      <div className="lg:hidden">
        <AmmoLogo size="small" />
      </div>
      <div className="hidden lg:block" />

      {/* Right side: network badge + wallet */}
      <div className="flex items-center gap-3">
        {/* AVAX balance */}
        {isConnected && !isReconnecting && avaxBalance && (
          <div
            className="hidden items-center gap-1.5 text-xs font-medium sm:flex"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
            </svg>
            <span>{formatAvax(avaxBalance.value)} AVAX</span>
          </div>
        )}

        {/* USDC balance */}
        {isConnected && !isReconnecting && usdc !== undefined && (
          <div
            className="hidden items-center gap-1.5 text-xs font-medium sm:flex"
            style={{ color: "var(--text-secondary)" }}
          >
            <UsdcIcon size={16} />
            <span>${formatUsdc(usdc)}</span>
          </div>
        )}

        {/* Faucet buttons (testnet only) */}
        {isTestnet && isConnected && !isReconnecting && <FaucetButtons />}

        {/* Network badge pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-ax-tertiary border border-border-default text-text-secondary">
          <svg
            width="12"
            height="12"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
          </svg>
          <span className="hidden sm:inline">{networkLabel}</span>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </div>

        <WalletButton />
      </div>
    </header>
  );
}
