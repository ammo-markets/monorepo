"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Inbox, RefreshCw } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { FinalizeMintDialog } from "./finalize-mint-dialog";
import type { AdminMintOrder } from "./finalize-mint-dialog";

function formatUsdc(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function MintOrdersTable() {
  const [selectedOrder, setSelectedOrder] = useState<AdminMintOrder | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminMintOrder[]>({
    queryKey: ["admin", "orders", "MINT"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders?type=MINT");
      if (!res.ok) throw new Error("Failed to fetch mint orders");
      const json = (await res.json()) as { orders: AdminMintOrder[] };
      return json.orders;
    },
    refetchInterval: 30_000,
  });

  const handleFinalized = useCallback(
    (orderId: string) => {
      // Optimistically remove from the query cache will happen on next refetch.
      // Trigger immediate refetch to update the list.
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
        <p className="text-sm">No pending mint orders</p>
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
                USDC Amount
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
                  {formatUsdc(order.amount)} USDC
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
                  <button
                    type="button"
                    disabled={!order.onChainOrderId}
                    title={
                      order.onChainOrderId
                        ? "Finalize this mint order"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <FinalizeMintDialog
          order={selectedOrder}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedOrder(null);
          }}
          onFinalized={handleFinalized}
        />
      )}
    </>
  );
}
