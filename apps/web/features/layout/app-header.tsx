"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useBalance, useChainId } from "wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useUsdcFaucet } from "@/hooks/use-usdc-faucet";
import { useAvaxFaucet } from "@/hooks/use-avax-faucet";
import { formatUnits } from "viem";
import { parseContractError } from "@/lib/errors";
import { AmmoLogo } from "./logo";
import { WalletButton, formatUsdc } from "./wallet-button";
import { UsdcIcon } from "./usdc-icon";

function formatAvax(value: bigint): string {
  const formatted = formatUnits(value, 18);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.001) return "<0.001";
  return num.toFixed(3);
}

export function AppHeader() {
  const { isConnected, isReconnecting, isWrongNetwork, address } = useWallet();
  const { usdc, refetch } = useTokenBalances();
  const chainId = useChainId();
  const { faucet, error, isPending, isConfirming, isConfirmed, isSimulating } =
    useUsdcFaucet(refetch);

  const { data: avaxBalance, refetch: refetchAvax } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  });

  const {
    request: requestAvax,
    status: avaxStatus,
    error: avaxError,
  } = useAvaxFaucet(() => {
    refetchAvax();
    refetch();
  });

  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  useEffect(() => {
    if (avaxError) {
      toast.error(avaxError);
    }
  }, [avaxError]);

  const isFuji = chainId === 43113;
  const faucetBusy = isPending || isConfirming || isSimulating;
  const faucetLabel = isConfirmed
    ? "Minted!"
    : isConfirming
      ? "Confirming..."
      : isPending
        ? "Requesting..."
        : "Get Test USDC";

  const showAvaxFaucet =
    isConnected &&
    !isReconnecting &&
    isFuji &&
    avaxBalance?.value === BigInt(0);
  const avaxBusy = avaxStatus === "requesting" || avaxStatus === "confirming";
  const avaxLabel =
    avaxStatus === "done"
      ? "Funded!"
      : avaxStatus === "confirming"
        ? "Confirming..."
        : avaxStatus === "requesting"
          ? "Sending..."
          : "Get Test AVAX";

  const networkLabel = "Avalanche Fuji";
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

        {/* AVAX faucet button (Fuji only, zero balance) */}
        {showAvaxFaucet && (
          <button
            type="button"
            onClick={requestAvax}
            disabled={avaxBusy}
            className="hidden items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 disabled:opacity-50 sm:flex"
            style={{
              backgroundColor: "color-mix(in srgb, #E84142 12%, transparent)",
              color: "#E84142",
            }}
          >
            <span className="hidden md:inline">{avaxLabel}</span>
            <span className="md:hidden">AVAX</span>
          </button>
        )}

        {/* USDC faucet button (Fuji only) */}
        {isConnected && !isReconnecting && isFuji && (
          <button
            type="button"
            onClick={faucet}
            disabled={faucetBusy}
            className="hidden items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 disabled:opacity-50 sm:flex"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--blue) 12%, transparent)",
              color: "var(--blue)",
            }}
          >
            <span className="hidden md:inline">{faucetLabel}</span>
            <span className="md:hidden">Faucet</span>
          </button>
        )}

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
