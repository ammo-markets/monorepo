"use client";

import {
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import type { Connector } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

export function useWallet() {
  const account = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const allConnectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork =
    account.isConnected && account.chainId !== avalancheFuji.id;

  // Deduplicate connectors by id
  const seen = new Set<string>();
  const connectors = allConnectors.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return {
    // State
    address: account.address,
    isConnected: account.isConnected,
    isReconnecting: account.isReconnecting,
    isWrongNetwork,
    chainId: account.chainId,

    // Connectors
    connectors,
    connectWith: (connector: Connector) => connect({ connector }),

    // Actions
    disconnect: () => disconnect(),
    switchToFuji: () => switchChain({ chainId: avalancheFuji.id }),

    // Loading
    isConnecting,
    isSwitching,
  };
}
