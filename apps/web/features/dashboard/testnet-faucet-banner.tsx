"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Coins } from "lucide-react";
import { useChainId } from "wagmi";
import { useUsdcFaucet } from "@/hooks/use-usdc-faucet";
import { parseContractError } from "@/lib/errors";

interface TestnetFaucetBannerProps {
  onSuccess?: () => void;
}

export function TestnetFaucetBanner({ onSuccess }: TestnetFaucetBannerProps) {
  const chainId = useChainId();
  const { faucet, error, isPending, isConfirming, isConfirmed, isSimulating } =
    useUsdcFaucet(onSuccess);

  useEffect(() => {
    if (error) {
      toast.error(parseContractError(error));
    }
  }, [error]);

  if (chainId !== 43113) return null;

  const label = isConfirmed
    ? "Minted!"
    : isConfirming
      ? "Confirming..."
      : isPending
        ? "Requesting..."
        : "Get Test USDC";

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--blue) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--blue) 30%, transparent)",
      }}
    >
      <Coins size={18} style={{ color: "var(--blue)" }} />
      <p className="flex-1 text-sm" style={{ color: "var(--blue)" }}>
        You&apos;re on Fuji testnet. Grab free USDC to try minting ammo tokens.
      </p>
      <button
        type="button"
        onClick={faucet}
        disabled={isPending || isConfirming || isSimulating}
        className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors duration-150 disabled:opacity-50"
        style={{
          backgroundColor: "color-mix(in srgb, var(--blue) 20%, transparent)",
          color: "var(--blue)",
        }}
      >
        {label}
      </button>
    </div>
  );
}
