"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Inbox, RefreshCw } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { FinalizeRedeemDialog } from "./finalize-redeem-dialog";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
}

function KycBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-green-900/30 text-green-400 border-green-800",
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    REJECTED: "bg-red-900/30 text-red-400 border-red-800",
    NONE: "bg-zinc-800 text-zinc-500 border-zinc-700",
  };

  const style = styles[status] ?? styles.NONE;

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
        <p>Failed to load orders</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-500">
        <Inbox className="h-8 w-8" />
        <p className="text-sm">No pending redeem orders</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-400">Order ID</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Wallet</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Caliber</th>
              <th className="px-4 py-3 font-medium text-zinc-400 text-right">
                Token Amount
              </th>
              <th className="px-4 py-3 font-medium text-zinc-400">KYC</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Shipping</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Time</th>
              <th className="px-4 py-3 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30"
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                  {order.walletAddress
                    ? truncateAddress(order.walletAddress)
                    : "N/A"}
                </td>
                <td className="px-4 py-3 text-zinc-200">{order.caliber}</td>
                <td className="px-4 py-3 text-right font-mono text-zinc-200">
                  {formatTokenAmount(order.amount)} rounds
                </td>
                <td className="px-4 py-3">
                  <KycBadge status={order.user?.kycStatus ?? "NONE"} />
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {order.shippingAddress
                    ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
                    : "None"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
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
                        ? "Finalize this redeem order"
                        : "Awaiting on-chain order ID"
                    }
                    onClick={() => {
                      setSelectedOrder(order);
                      setDialogOpen(true);
                    }}
                    className="rounded-md bg-amber-600/80 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
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
    </>
  );
}
