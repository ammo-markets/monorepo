"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Inbox, RefreshCw } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { FinalizeRedeemDialog } from "./finalize-redeem-dialog";
import { CancelRedeemDialog } from "./cancel-redeem-dialog";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
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

  // Default/NONE case uses theme variables
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

export function RedeemOrdersTable() {
  const [selectedOrder, setSelectedOrder] = useState<AdminRedeemOrder | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<AdminRedeemOrder | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminRedeemOrder[]>({
    queryKey: ["admin", "orders", "REDEEM"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders?type=REDEEM");
      if (!res.ok) throw new Error("Failed to fetch redeem orders");
      const json = (await res.json()) as { orders: AdminRedeemOrder[] };
      return json.orders;
    },
    refetchInterval: 30_000,
  });

  const handleFinalized = useCallback(
    (orderId: string) => {
      void refetch();
    },
    [refetch],
  );

  const handleCancelled = useCallback(
    (orderId: string) => {
      void refetch();
    },
    [refetch],
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        style={{ color: "var(--text-secondary)" }}
      >
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 py-12"
        style={{ color: "var(--text-muted)" }}
      >
        <Inbox className="h-8 w-8" />
        <p className="text-sm">No pending redeem orders</p>
      </div>
    );
  }

  return (
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
                Shipping
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
                className="border-b transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: "var(--border-default)" }}
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
                  {formatTokenAmount(order.amount)} rounds
                </td>
                <td className="px-4 py-3">
                  <KycBadge status={order.user?.kycStatus ?? "NONE"} />
                </td>
                <td
                  className="px-4 py-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {order.shippingAddress
                    ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                    : "None"}
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!order.onChainOrderId}
                      title={
                        order.onChainOrderId
                          ? "Finalize this redeem order"
                          : "Awaiting on-chain order ID"
                      }
                      onClick={() => {
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
                      onClick={() => {
                        setCancelOrder(order);
                        setCancelDialogOpen(true);
                      }}
                      className="rounded-md bg-red-900/30 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
