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
      className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between px-4 lg:left-60"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
        borderBottom: "1px solid var(--border-default)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
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
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
          }}
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
