"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useBalance, useChainId } from "wagmi";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useUsdcFaucet } from "@/hooks/use-usdc-faucet";
import { useAvaxFaucet } from "@/hooks/use-avax-faucet";
import { parseContractError } from "@/lib/errors";
import { activeChain } from "@/lib/chain";

export function FaucetButtons() {
  const { address } = useWallet();
  const { refetch } = useTokenBalances();
  const chainId = useChainId();

  const { faucet, error, isPending, isConfirming, isConfirmed, isSimulating } =
    useUsdcFaucet(refetch);

  const { data: avaxBalance, refetch: refetchAvax } = useBalance({
    address,
    query: { enabled: !!address },
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

  const isActiveChain = chainId === activeChain.id;
  const faucetBusy = isPending || isConfirming || isSimulating;
  const faucetLabel = isConfirmed
    ? "Minted!"
    : isConfirming
      ? "Confirming..."
      : isPending
        ? "Requesting..."
        : "Get Test USDT";

  const showAvaxFaucet = isActiveChain && avaxBalance?.value === BigInt(0);
  const avaxBusy = avaxStatus === "requesting" || avaxStatus === "confirming";
  const avaxLabel =
    avaxStatus === "done"
      ? "Funded!"
      : avaxStatus === "confirming"
        ? "Confirming..."
        : avaxStatus === "requesting"
          ? "Sending..."
          : "Get Test AVAX";

  return (
    <>
      {/* AVAX faucet button (zero balance only) */}
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

      {/* USDC faucet button */}
      {isActiveChain && (
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
    </>
  );
}
