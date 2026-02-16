"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useMarketData } from "@/hooks/use-market-data";
import { useOrders } from "@/hooks/use-orders";
import {
  BalanceCards,
  RecentOrders,
  PendingBanner,
  TestnetFaucetBanner,
} from "@/features/dashboard";
import { ConnectWalletCTA } from "@/features/shared/connect-wallet-cta";

export default function DashboardPage() {
  const { address, isConnected } = useAuth();
  const {
    tokens,
    usdc,
    isLoading: balancesLoading,
    refetch,
  } = useTokenBalances();
  const { data: marketData = [], isLoading: marketLoading } = useMarketData();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(address);

  const pendingCount = useMemo(
    () =>
      orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING")
        .length,
    [orders],
  );

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <h1
          className="mb-6 text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <ConnectWalletCTA
          title="Connect your wallet to get started"
          description="Link your wallet to view balances, mint and redeem ammo tokens, and track your orders."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Dashboard
      </h1>

      <div className="flex flex-col gap-6">
        <PendingBanner pendingCount={pendingCount} />
        <TestnetFaucetBanner onSuccess={refetch} />

        <BalanceCards
          balances={tokens}
          usdc={usdc}
          marketData={marketData}
          isLoading={balancesLoading || marketLoading}
        />

        <section>
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Orders
          </h2>
          <RecentOrders orders={orders} isLoading={ordersLoading} />
        </section>
      </div>
    </div>
  );
}
