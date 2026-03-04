"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
  Check,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { truncateAddress } from "@/lib/utils";
import { useAdminMintOrders } from "@/hooks/use-admin-orders";
import {
  useUnbackedTotals,
  useMarkBacked,
} from "@/hooks/use-admin-inventory";
import type { UnbackedCaliber } from "@/hooks/use-admin-inventory";
import { OrderDetailDrawer } from "./order-detail-drawer";
import type { AdminMintOrder } from "./finalize-mint-dialog";

const CALIBER_OPTIONS = [
  { label: "All Calibers", value: "" },
  { label: "9mm Practice", value: "9MM_PRACTICE" },
  { label: "9mm Self Defense", value: "9MM_SELF_DEFENSE" },
  { label: "5.56 Self Defense", value: "556_SELF_DEFENSE" },
  { label: "5.56 NATO Practice", value: "556_NATO_PRACTICE" },
] as const;

function formatUsdc(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

function formatRounds(tokenAmount: string | null): string {
  if (!tokenAmount) return "0";
  const rounds = BigInt(tokenAmount) / 10n ** 18n;
  return Number(rounds).toLocaleString();
}

function BackingBadge({ backedAt }: { backedAt: string | null }) {
  if (backedAt) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium bg-green-900/30 text-green-400 border-green-800"
        title={`Backed on ${new Date(backedAt).toLocaleDateString()}`}
      >
        <Check className="h-3 w-3" />
        BACKED
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium bg-yellow-900/30 text-yellow-400 border-yellow-800">
      UNBACKED
    </span>
  );
}

// ── Unbacked Inventory Cards ─────────────────────

function ConfirmBackedDialog({
  cal,
  open,
  onConfirm,
  onCancel,
  isPending,
}: {
  cal: UnbackedCaliber;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-md rounded-xl border p-6"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Confirm Backing
        </h3>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Mark <strong>{cal.orderCount}</strong> unbacked {cal.name} orders
          as backed? This covers{" "}
          <strong>{Number(cal.rounds).toLocaleString()} rounds</strong>{" "}
          (${cal.usdcTotal} USDC).
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-ax-tertiary"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
          >
            {isPending ? "Marking..." : "Mark Backed"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnbackedInventoryCards() {
  const { data, isLoading } = useUnbackedTotals();
  const markBacked = useMarkBacked();
  const [confirmCaliber, setConfirmCaliber] = useState<UnbackedCaliber | null>(
    null,
  );

  const handleMarkBacked = useCallback(
    (cal: UnbackedCaliber) => {
      markBacked.mutate(
        { caliber: cal.caliber },
        {
          onSuccess: (result) => {
            toast.success(
              `Marked ${result.markedCount} ${cal.name} orders as backed (${Number(result.rounds).toLocaleString()} rounds)`,
            );
            setConfirmCaliber(null);
          },
          onError: (err) => {
            toast.error(err.message);
          },
        },
      );
    },
    [markBacked],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border p-5"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div
              className="mb-3 h-4 w-24 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-8 w-16 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.unbacked.map((cal) => {
          const hasUnbacked = cal.orderCount > 0;
          return (
            <div
              key={cal.caliber}
              className="rounded-lg border p-5"
              style={{
                borderColor: hasUnbacked
                  ? "var(--brass)"
                  : "var(--border-default)",
                boxShadow: hasUnbacked ? "0 0 0 1px var(--brass)" : "none",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                <Package
                  className="h-4 w-4"
                  style={{ color: "var(--brass)" }}
                />
                {cal.name}
              </div>

              {hasUnbacked ? (
                <>
                  <p
                    className="mt-2 text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {Number(cal.rounds).toLocaleString()}{" "}
                    <span
                      className="text-sm font-normal"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      rounds
                    </span>
                  </p>
                  <div
                    className="mt-1 flex items-center gap-3 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>{cal.orderCount} orders</span>
                    <span>${cal.usdcTotal} USDC</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmCaliber(cal)}
                    className="mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: "var(--brass)",
                      color: "var(--bg-primary)",
                    }}
                  >
                    Mark Backed
                  </button>
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <Check
                    className="h-5 w-5"
                    style={{ color: "var(--green, #22c55e)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--green, #22c55e)" }}
                  >
                    All backed
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmCaliber && (
        <ConfirmBackedDialog
          cal={confirmCaliber}
          open={!!confirmCaliber}
          onConfirm={() => handleMarkBacked(confirmCaliber)}
          onCancel={() => setConfirmCaliber(null)}
          isPending={markBacked.isPending}
        />
      )}
    </>
  );
}

// ── Main Component ───────────────────────────────

export function MintOrdersTable() {
  // Drawer state
  const [drawerOrder, setDrawerOrder] = useState<AdminMintOrder | null>(null);
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

  const { data, isLoading, error, refetch } = useAdminMintOrders({
    search: debouncedSearch,
    caliber: caliberFilter,
    page: currentPage,
  });

  const orders = data?.orders;
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDrawerAction = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Pagination display
  const pageStart =
    orders && orders.length > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const pageEnd = orders ? pageStart + orders.length - 1 : 0;

  return (
    <div className="space-y-6">
      {/* Section 1: Unbacked Inventory Cards */}
      <UnbackedInventoryCards />

      {/* Section 2: Order History */}
      <div>
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Order History
        </h3>

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
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
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
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
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
              className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-ax-tertiary"
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
                : "No mint orders"}
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
                      USDC Amt
                    </th>
                    <th
                      className="px-4 py-3 font-medium text-right"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Rounds
                    </th>
                    <th
                      className="px-4 py-3 font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Backing
                    </th>
                    <th
                      className="px-4 py-3 font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-b transition-colors hover:bg-ax-secondary"
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
                        {formatUsdc(order.usdcAmount ?? "0")} USDC
                      </td>
                      <td
                        className="px-4 py-3 text-right font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatRounds(order.tokenAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <BackingBadge backedAt={order.backedAt} />
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
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
                    className="rounded-md border p-1.5 transition-colors hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "var(--border-hover)" }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-md border p-1.5 transition-colors hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      {/* Drawer */}
      <OrderDetailDrawer
        order={drawerOrder}
        type="MINT"
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDrawerOrder(null);
        }}
        onActionComplete={handleDrawerAction}
      />
    </div>
  );
}
