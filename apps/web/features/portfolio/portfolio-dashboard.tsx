"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { formatUnits } from "viem";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ConnectWalletCTA } from "@/features/shared/connect-wallet-cta";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useMarketData } from "@/hooks/use-market-data";
import { useOrders } from "@/hooks/use-orders";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { CALIBER_SPECS, CALIBERS } from "@ammo-exchange/shared";
import {
  PortfolioHeroSkeleton,
  OrdersTableSkeleton,
  ActiveOrdersSkeleton,
} from "./portfolio-skeletons";
import {
  EmptyHoldings,
  EmptyOrderHistory,
  EmptyFilteredOrders,
} from "./portfolio-empty-states";
import type { HoldingRow } from "./holdings-row";
import { PortfolioHero } from "./portfolio-hero";
import { OrdersDesktopRow, OrderMobileCard } from "./orders-row";
import { PrimersSection } from "./primers-section";
import { ActiveOrderCard } from "./active-order-card";

/* ────────────── Constants ────────────── */

const ORDERS_PAGE_SIZE = 10;

/* ────────────── Types ────────────── */

type HistoryFilter = "All" | "Mint" | "Redeem" | "Failed";

/* ────────────── Main Dashboard ────────────── */

export function PortfolioDashboard() {
  const { address, isConnected, isReconnecting } = useAuth();
  const { tokens, usdc, isLoading: balancesLoading } = useTokenBalances();

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("All");
  const [visibleCount, setVisibleCount] = useState(ORDERS_PAGE_SIZE);
  const [caliberFilter, setCaliberFilter] = useState<Caliber | null>(null);
  const orderHistorySectionRef = useRef<HTMLElement>(null);

  // Market prices
  const { data: marketData = [], isLoading: marketLoading } = useMarketData();

  // Orders
  const { data: orders = [], isLoading: ordersLoading } = useOrders(address);

  // Compute holdings from on-chain balances + market prices
  const holdings: HoldingRow[] = useMemo(() => {
    const priceMap = new Map(
      marketData.map((m) => [m.caliber, m.pricePerRound]),
    );

    return CALIBERS.map((caliber) => {
      const raw = tokens[caliber] ?? BigInt(0);
      const balance = Math.floor(Number(formatUnits(raw, 18)));
      const price = priceMap.get(caliber) ?? 0;
      const value = balance * price;
      const spec = CALIBER_SPECS[caliber];
      return {
        caliber,
        symbol: spec.tokenSymbol,
        name: spec.name,
        balance,
        price,
        value,
      };
    }).filter((h) => h.balance > 0);
  }, [tokens, marketData]);

  // Total portfolio value
  const totalValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.value, 0);
  }, [holdings]);

  // USDC balance display
  const usdcBalance = usdc ? Number(formatUnits(usdc, 6)) : 0;

  // Split orders into active vs history
  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o: OrderFromAPI) =>
          o.status === "PENDING" || o.status === "PROCESSING",
      ),
    [orders],
  );

  const historyOrders = useMemo(
    () =>
      orders.filter(
        (o: OrderFromAPI) =>
          o.status === "COMPLETED" ||
          o.status === "FAILED" ||
          o.status === "CANCELLED",
      ),
    [orders],
  );

  // Filter history by type/status + optional caliber
  const filteredHistory = useMemo(() => {
    let result = historyOrders;
    if (historyFilter === "Mint")
      result = result.filter((o: OrderFromAPI) => o.type === "MINT");
    else if (historyFilter === "Redeem")
      result = result.filter((o: OrderFromAPI) => o.type === "REDEEM");
    else if (historyFilter === "Failed")
      result = result.filter(
        (o: OrderFromAPI) => o.status === "FAILED" || o.status === "CANCELLED",
      );
    if (caliberFilter)
      result = result.filter((o: OrderFromAPI) => o.caliber === caliberFilter);
    return result;
  }, [historyOrders, historyFilter, caliberFilter]);

  const visibleHistory = filteredHistory.slice(0, visibleCount);
  const remainingCount = filteredHistory.length - visibleHistory.length;

  // Tab counts computed from historyOrders
  const tabCounts = useMemo(() => {
    const mint = historyOrders.filter(
      (o: OrderFromAPI) => o.type === "MINT",
    ).length;
    const redeem = historyOrders.filter(
      (o: OrderFromAPI) => o.type === "REDEEM",
    ).length;
    const failed = historyOrders.filter(
      (o: OrderFromAPI) => o.status === "FAILED" || o.status === "CANCELLED",
    ).length;
    return {
      All: historyOrders.length,
      Mint: mint,
      Redeem: redeem,
      Failed: failed,
    } as Record<HistoryFilter, number>;
  }, [historyOrders]);

  // Callbacks
  const handleViewOrdersForCaliber = useCallback((caliber: Caliber) => {
    setHistoryFilter("All");
    setCaliberFilter(caliber);
    setVisibleCount(ORDERS_PAGE_SIZE);
    setTimeout(() => {
      orderHistorySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, []);

  const handleHistoryTabChange = useCallback((tab: HistoryFilter) => {
    setHistoryFilter(tab);
    setVisibleCount(ORDERS_PAGE_SIZE);
    setCaliberFilter(null);
  }, []);

  // Show loading skeleton during reconnection (prevents hydration mismatch)
  if (isReconnecting) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <PortfolioHeroSkeleton />
        <section className="mt-10">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Order History
          </h2>
          <OrdersTableSkeleton />
        </section>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <ConnectWalletCTA
        title="Connect your wallet to view your portfolio"
        description="Link your wallet to see your holdings, track orders, and manage your ammo tokens."
      />
    );
  }

  const dataLoading = balancesLoading || marketLoading;
  const historyFilterTabs: HistoryFilter[] = [
    "All",
    "Mint",
    "Redeem",
    "Failed",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Section 1: Portfolio Hero (chart + legend + cards) */}
      {dataLoading ? (
        <PortfolioHeroSkeleton />
      ) : holdings.length === 0 ? (
        <div>
          <h1
            className="mb-1 text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Portfolio
          </h1>
          <p
            className="font-mono text-4xl font-bold tabular-nums tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            $0.00
          </p>
          {usdcBalance > 0 && (
            <p
              className="mt-1.5 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              + ${usdcBalance.toFixed(2)} USDT available
            </p>
          )}
          <div className="mt-6">
            <EmptyHoldings />
          </div>
        </div>
      ) : (
        <PortfolioHero
          holdings={holdings}
          totalValue={totalValue}
          usdcBalance={usdcBalance}
          onViewOrdersForCaliber={handleViewOrdersForCaliber}
        />
      )}

      {/* Active Orders */}
      {ordersLoading ? (
        <section className="mt-6">
          <h2
            className="mb-3 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Active Orders
          </h2>
          <ActiveOrdersSkeleton />
        </section>
      ) : (
        activeOrders.length > 0 && (
          <section className="mt-6">
            <h2
              className="mb-3 text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Active Orders
              <span
                className="ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--blue) 15%, transparent)",
                  color: "var(--blue)",
                }}
              >
                {activeOrders.length}
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {activeOrders.map((order: OrderFromAPI) => (
                <ActiveOrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Order History */}
      <section className="mt-10" ref={orderHistorySectionRef}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Order History
          </h2>
          {/* Tab filters */}
          <div
            className="flex items-center gap-1 overflow-x-auto rounded-lg p-1"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            role="tablist"
            aria-label="Order history filters"
          >
            {historyFilterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={historyFilter === tab}
                className="whitespace-nowrap rounded-md px-3 py-2.5 text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor:
                    historyFilter === tab
                      ? "var(--bg-tertiary)"
                      : "transparent",
                  color:
                    historyFilter === tab
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  border:
                    historyFilter === tab
                      ? "1px solid var(--border-hover)"
                      : "1px solid transparent",
                }}
                onClick={() => handleHistoryTabChange(tab)}
              >
                {tab}
                {tabCounts[tab] > 0 && (
                  <span
                    className="ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor:
                        historyFilter === tab
                          ? "var(--bg-secondary)"
                          : "var(--bg-tertiary)",
                      color:
                        historyFilter === tab
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Caliber filter pill */}
        {caliberFilter && (
          <div className="mb-3 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--brass) 15%, transparent)",
                color: "var(--brass)",
              }}
            >
              {caliberFilter} orders
              <button
                type="button"
                onClick={() => setCaliberFilter(null)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
                aria-label={`Clear ${caliberFilter} filter`}
              >
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {ordersLoading ? (
          <OrdersTableSkeleton />
        ) : filteredHistory.length === 0 ? (
          historyFilter === "All" && !caliberFilter ? (
            <EmptyOrderHistory />
          ) : (
            <EmptyFilteredOrders filter={caliberFilter ?? historyFilter} />
          )
        ) : (
          <>
            {/* Desktop table */}
            <div
              className="hidden overflow-hidden rounded-xl md:block"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border-default)",
                      }}
                    >
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Order ID
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Caliber
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Amount
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleHistory.map((order: OrderFromAPI, i: number) => (
                      <OrdersDesktopRow
                        key={order.id}
                        order={order}
                        isLast={i === visibleHistory.length - 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {visibleHistory.map((order: OrderFromAPI) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>

            {/* Show more */}
            {remainingCount > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + ORDERS_PAGE_SIZE)}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-150"
                  style={{
                    border: "1px solid var(--border-hover)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Show more ({remainingCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Primers — hidden until feature is ready */}
      {false && (
        <div className="mt-10">
          <PrimersSection primers={0} />
        </div>
      )}
    </div>
  );
}
