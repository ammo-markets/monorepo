"use client";

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
