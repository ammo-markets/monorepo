"use client";

import { useWallet } from "@/hooks/use-wallet";
import { AmmoLogo } from "./logo";
import { WalletButton } from "./wallet-button";

export function AppHeader() {
  const { isConnected, isReconnecting, isWrongNetwork } = useWallet();

  const networkLabel = "Avalanche Fuji";
  const dotColor =
    isConnected && !isReconnecting && isWrongNetwork
      ? "var(--amber)"
      : "var(--green)";

  return (
    <header
      className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-border-default bg-ax-secondary lg:left-60 px-4 sm:px-6"
    >
      {/* Mobile: show logo (sidebar is hidden). Desktop: empty spacer */}
      <div className="lg:hidden">
        <AmmoLogo size="small" />
      </div>
      <div className="hidden lg:block" />

      {/* Right side: network badge + wallet */}
      <div className="flex items-center gap-3">
        {/* Network badge pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-ax-tertiary border border-border-default text-text-secondary"
        >
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
