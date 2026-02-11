"use client";

import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";

export function useWallet() {
  const account = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork =
    account.isConnected && account.chainId !== avalancheFuji.id;

  // Auto-register user in database on wallet connect
  useEffect(() => {
    if (!account.address) return;

    fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: account.address }),
    }).catch(() => {
      // Silent fail -- registration is best-effort.
      // User record will be created by worker on first on-chain event as fallback.
    });
  }, [account.address]);

  return {
    // State
    address: account.address,
    isConnected: account.isConnected,
    isReconnecting: account.isReconnecting,
    isWrongNetwork,
    chainId: account.chainId,

    // Actions
    connect: () => connect({ connector: injected() }),
    disconnect: () => disconnect(),
    switchToFuji: () => switchChain({ chainId: avalancheFuji.id }),

    // Loading
    isConnecting,
    isSwitching,
  };
}
