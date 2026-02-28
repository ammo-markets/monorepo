"use client";

import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { activeChain } from "@/lib/chain";

export function useWallet() {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork =
    account.isConnected && account.chainId !== activeChain.id;

  return {
    address: account.address,
    isConnected: account.isConnected,
    isReconnecting: account.isReconnecting,
    isWrongNetwork,
    chainId: account.chainId,
    disconnect: () => disconnect(),
    switchNetwork: () => switchChain({ chainId: activeChain.id }),
    isSwitching,
  };
}
