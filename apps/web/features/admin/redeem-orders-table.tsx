"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
} from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { FinalizeRedeemDialog } from "./finalize-redeem-dialog";
import { CancelRedeemDialog } from "./cancel-redeem-dialog";
import { OrderDetailDrawer } from "./order-detail-drawer";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

const CALIBER_OPTIONS = [
  { label: "All Calibers", value: "" },
  { label: "9MM", value: "9MM" },
  { label: "5.56", value: "556" },
  { label: ".22 LR", value: "22LR" },
  { label: ".308", value: "308" },
] as const;

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    PROCESSING: "bg-blue-900/30 text-blue-400 border-blue-800",
    COMPLETED: "bg-green-900/30 text-green-400 border-green-800",
    FAILED: "bg-red-900/30 text-red-400 border-red-800",
    CANCELLED: "bg-red-900/30 text-red-400 border-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-900/30 text-gray-400 border-gray-800"}`}
    >
      {status}
    </span>
  );
}

function KycBadge({ status }: { status: string }) {
  const semantic: Record<string, string> = {
    APPROVED: "bg-green-900/30 text-green-400 border-green-800",
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  };

  const semanticStyle = semantic[status];

  if (semanticStyle) {
    return (
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${semanticStyle}`}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        color: "var(--text-muted)",
        borderColor: "var(--border-hover)",
      }}
    >
      {status}
    </span>
  );
}

interface PaginatedResponse {
  orders: AdminRedeemOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function RedeemOrdersTable() {
  const [selectedOrder, setSelectedOrder] = useState<AdminRedeemOrder | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<AdminRedeemOrder | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Drawer state
  const [drawerOrder, setDrawerOrder] = useState<AdminRedeemOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search, filter, pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [caliberFilter, setCaliberFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [caliberFilter]);

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse>({
    queryKey: [
      "admin",
      "orders",
      "REDEEM",
      debouncedSearch,
      caliberFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: "REDEEM",
        page: String(currentPage),
        limit: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (caliberFilter) params.set("caliber", caliberFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch redeem orders");
      return (await res.json()) as PaginatedResponse;
    },
    refetchInterval: 30_000,
  });

  const orders = data?.orders;
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleFinalized = useCallback(
    (_orderId: string) => {
      void refetch();
    },
    [refetch],
  );

  const handleCancelled = useCallback(
    (_orderId: string) => {
      void refetch();
    },
    [refetch],
  );

  const handleDrawerAction = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Pagination display
  const pageStart =
    orders && orders.length > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const pageEnd = orders ? pageStart + orders.length - 1 : 0;

  return (
    <>
      {/* Controls: Search + Caliber Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search by wallet, order ID, tx hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
            style={{
              borderColor: "var(--border-hover)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <select
          value={caliberFilter}
          onChange={(e) => setCaliberFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]"
          style={{
            borderColor: "var(--border-hover)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
          }}
        >
          {CALIBER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          style={{ color: "var(--text-secondary)" }}
        >
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-12"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>Failed to load orders</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-primary)",
            }}
          >
            Retry
          </button>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12"
          style={{ color: "var(--text-muted)" }}
        >
          <Inbox className="h-8 w-8" />
          <p className="text-sm">
            {debouncedSearch || caliberFilter
              ? "No orders match your filters"
              : "No redeem orders"}
          </p>
        </div>
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-xl border"
            style={{ borderColor: "var(--border-default)" }}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: "var(--border-default)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order ID
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Wallet
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Caliber
                  </th>
                  <th
                    className="px-4 py-3 font-medium text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Token Amount
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    KYC
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Time
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderColor: "var(--border-default)" }}
                    onClick={() => {
                      setDrawerOrder(order);
                      setDrawerOpen(true);
                    }}
                  >
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.id.slice(0, 8)}
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.walletAddress
                        ? truncateAddress(order.walletAddress)
                        : "N/A"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.caliber}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatTokenAmount(order.tokenAmount ?? "0")} rounds
                    </td>
                    <td className="px-4 py-3">
                      <KycBadge status={order.user?.kycStatus ?? "NONE"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!order.onChainOrderId}
                            title={
                              order.onChainOrderId
                                ? "Finalize this redeem order"
                                : "Awaiting on-chain order ID"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setDialogOpen(true);
                            }}
                            className="rounded-md px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--brass-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--brass)",
                              color: "var(--bg-primary)",
                            }}
                          >
                            Finalize
                          </button>
                          <button
                            type="button"
                            disabled={!order.onChainOrderId}
                            title={
                              order.onChainOrderId
                                ? "Cancel this redeem order"
                                : "Awaiting on-chain order ID"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancelOrder(order);
                              setCancelDialogOpen(true);
                            }}
                            className="rounded-md bg-red-900/30 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="mt-4 flex items-center justify-between text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>
              Showing {pageStart}-{pageEnd} of {total} orders
            </span>
            <div className="flex items-center gap-3">
              <span style={{ color: "var(--text-muted)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md border p-1.5 transition-colors hover:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--border-hover)" }}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md border p-1.5 transition-colors hover:bg-[var(--bg-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--border-hover)" }}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
      <OrderDetailDrawer
        order={drawerOrder}
        type="REDEEM"
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDrawerOrder(null);
        }}
        onActionComplete={handleDrawerAction}
      />

      {selectedOrder && (
        <FinalizeRedeemDialog
          order={selectedOrder}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          onFinalized={handleFinalized}
        />
      )}

      {cancelOrder && (
        <CancelRedeemDialog
          order={cancelOrder}
          open={cancelDialogOpen}
          onOpenChange={(open) => {
            setCancelDialogOpen(open);
            if (!open) setCancelOrder(null);
          }}
          onCancelled={handleCancelled}
        />
      )}
    </>
  );
}
