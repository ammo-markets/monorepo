"use client";

import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

export function useWallet() {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork =
    account.isConnected && account.chainId !== avalancheFuji.id;

  return {
    address: account.address,
    isConnected: account.isConnected,
    isReconnecting: account.isReconnecting,
    isWrongNetwork,
    chainId: account.chainId,
    disconnect: () => disconnect(),
    switchToFuji: () => switchChain({ chainId: avalancheFuji.id }),
    isSwitching,
  };
}
