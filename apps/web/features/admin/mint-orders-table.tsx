"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Inbox, RefreshCw } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

interface AdminMintOrder {
  id: string;
  walletAddress: string | null;
  caliber: string;
  amount: string;
  createdAt: string;
  onChainOrderId: string | null;
  txHash: string | null;
}

function formatUsdc(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

export function MintOrdersTable() {
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
        <p className="text-sm">No pending mint orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-400">Order ID</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Wallet</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Caliber</th>
            <th className="px-4 py-3 font-medium text-zinc-400 text-right">
              USDC Amount
            </th>
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
                {formatUsdc(order.amount)} USDC
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="rounded-md bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-500 cursor-not-allowed"
                >
                  Finalize
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
