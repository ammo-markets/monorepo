"use client";

import { useMemo } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useMarketData } from "@/hooks/use-market-data";
import { useOrders } from "@/hooks/use-orders";
import {
  BalanceCards,
  RecentOrders,
  QuickActions,
  PendingBanner,
} from "@/features/dashboard";

export default function DashboardPage() {
  const { address } = useWallet();
  const { tokens, usdc, isLoading: balancesLoading } = useTokenBalances();
  const { data: marketData = [], isLoading: marketLoading } = useMarketData();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(address);

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING",
      ).length,
    [orders],
  );

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

        <BalanceCards
          balances={tokens}
          usdc={usdc}
          marketData={marketData}
          isLoading={balancesLoading || marketLoading}
        />

        <QuickActions />

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
