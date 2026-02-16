"use client";

import { useChainId } from "wagmi";
import { useUsdcFaucet } from "@/hooks/use-usdc-faucet";

interface UsdcFaucetButtonProps {
  onSuccess?: () => void;
}

export function UsdcFaucetButton({ onSuccess }: UsdcFaucetButtonProps) {
  const chainId = useChainId();
  const { faucet, isPending, isConfirming, isConfirmed } =
    useUsdcFaucet(onSuccess);

  // Only show on Fuji testnet
  if (chainId !== 43113) return null;

  const label = isConfirmed
    ? "Minted!"
    : isConfirming
      ? "Confirming..."
      : isPending
        ? "Requesting..."
        : "Get Test USDC";

  return (
    <button
      type="button"
      onClick={faucet}
      disabled={isPending || isConfirming}
      className="rounded-lg border border-border-hover bg-transparent px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors duration-150 hover:border-brass-border hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
