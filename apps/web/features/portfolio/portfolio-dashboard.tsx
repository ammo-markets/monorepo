"use client";

import { useState, useMemo, useCallback } from "react";
import { formatUnits } from "viem";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ConnectWalletCTA } from "@/features/shared/connect-wallet-cta";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useMarketData } from "@/hooks/use-market-data";
import { useOrders } from "@/hooks/use-orders";
import { truncateAddress, snowtraceAddressUrl } from "@/lib/utils";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import {
  HeaderSkeleton,
  HoldingsTableSkeleton,
  OrdersTableSkeleton,
} from "./portfolio-skeletons";
import { EmptyHoldings, EmptyOrders } from "./portfolio-empty-states";
import { HoldingsDesktopRow, HoldingsMobileCard } from "./holdings-row";
import type { HoldingRow } from "./holdings-row";
import { OrdersDesktopRow, OrderMobileCard } from "./orders-row";
import { PrimersSection } from "./primers-section";

/* ────────────── Constants ────────────── */

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];

/* ────────────── Types ────────────── */

type OrderFilter = "All" | "Active" | "Completed" | "Failed";

/* ────────────── Main Dashboard ────────────── */

export function PortfolioDashboard() {
  const { address, isConnected, isReconnecting } = useAuth();
  const { tokens, usdc, isLoading: balancesLoading } = useTokenBalances();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("All");

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
        symbol: caliber,
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === "All") return orders;
    if (orderFilter === "Active")
      return orders.filter(
        (o: OrderFromAPI) =>
          o.status === "PENDING" || o.status === "PROCESSING",
      );
    if (orderFilter === "Completed")
      return orders.filter((o: OrderFromAPI) => o.status === "COMPLETED");
    return orders.filter(
      (o: OrderFromAPI) => o.status === "FAILED" || o.status === "CANCELLED",
    );
  }, [orderFilter, orders]);

  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address).catch(() => {});
    }
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  }, [address]);

  // Show loading skeleton during reconnection (prevents hydration mismatch)
  if (isReconnecting) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <HeaderSkeleton />
        <section className="mt-10">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Holdings
          </h2>
          <HoldingsTableSkeleton />
        </section>
        <section className="mt-10">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Orders
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
  const orderFilterTabs: OrderFilter[] = [
    "All",
    "Active",
    "Completed",
    "Failed",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Section 1: Portfolio Value Header */}
      {dataLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              ${totalValue.toFixed(2)}
            </p>
            {usdcBalance > 0 && (
              <p
                className="mt-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                + ${usdcBalance.toFixed(2)} USDC available
              </p>
            )}
          </div>

          {/* Wallet address */}
          {address && (
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-2.5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {/* Identicon */}
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: "var(--brass-muted)",
                  color: "var(--brass)",
                }}
              >
                {address.slice(2, 3).toUpperCase()}
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {truncateAddress(address)}
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 text-text-muted hover:bg-ax-tertiary hover:text-text-secondary"
                onClick={handleCopyAddress}
                aria-label="Copy address"
              >
                {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <a
                href={snowtraceAddressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 text-text-muted hover:bg-ax-tertiary hover:text-text-secondary"
                aria-label="View on explorer"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Holdings */}
      <section className="mt-10">
        <h2
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Holdings
        </h2>

        {dataLoading ? (
          <HoldingsTableSkeleton />
        ) : holdings.length === 0 ? (
          <EmptyHoldings />
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
                        Caliber
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Balance
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Price
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Value
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, i) => (
                      <tr
                        key={holding.caliber}
                        className="transition-colors duration-100 hover:bg-ax-tertiary"
                        style={{
                          borderBottom:
                            i < holdings.length - 1
                              ? "1px solid var(--border-default)"
                              : "none",
                        }}
                      >
                        <HoldingsDesktopRow
                          holding={holding}
                          isLast={i === holdings.length - 1}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {holdings.map((holding) => (
                <HoldingsMobileCard key={holding.caliber} holding={holding} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Section 3: Orders */}
      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Orders
          </h2>
          {/* Tab filters */}
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            role="tablist"
            aria-label="Order filters"
          >
            {orderFilterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={orderFilter === tab}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor:
                    orderFilter === tab ? "var(--bg-tertiary)" : "transparent",
                  color:
                    orderFilter === tab
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  border:
                    orderFilter === tab
                      ? "1px solid var(--border-hover)"
                      : "1px solid transparent",
                }}
                onClick={() => setOrderFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {ordersLoading ? (
          <OrdersTableSkeleton />
        ) : filteredOrders.length === 0 ? (
          orderFilter === "All" ? (
            <EmptyOrders />
          ) : (
            <div
              className="flex items-center justify-center rounded-xl px-6 py-10 text-center"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No {orderFilter.toLowerCase()} orders.
              </p>
            </div>
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
                    {filteredOrders.map((order: OrderFromAPI, i: number) => (
                      <OrdersDesktopRow
                        key={order.id}
                        order={order}
                        isLast={i === filteredOrders.length - 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredOrders.map((order: OrderFromAPI) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Section 4: Primers */}
      <div className="mt-10">
        <PrimersSection primers={0} />
      </div>
    </div>
  );
}
