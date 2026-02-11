"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";

interface CaliberSupply {
  caliber: string;
  name: string;
  totalSupply: number;
}

interface StatsData {
  treasuryUsdc: string;
  totalRedeemed: number;
  totalMinted: number;
  pendingOrders: number;
  calibers: CaliberSupply[];
}

export function ProtocolStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = (await res.json()) as StatsData;
      setStats(data);
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="mb-3 h-4 w-20 rounded bg-zinc-700" />
              <div className="h-8 w-24 rounded bg-zinc-700" />
            </div>
          ))}
        </div>
        {/* Skeleton table */}
        <div className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 h-4 w-32 rounded bg-zinc-700" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-full rounded bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
        <p>{error ?? "Failed to load stats"}</p>
        <button
          type="button"
          onClick={() => void fetchStats()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Treasury Balance",
      value: `$${Number(stats.treasuryUsdc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      icon: DollarSign,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
    },
    {
      label: "Completed Mints",
      value: stats.totalMinted.toLocaleString(),
      icon: ArrowUpCircle,
    },
    {
      label: "Completed Redeems",
      value: stats.totalRedeemed.toLocaleString(),
      icon: ArrowDownCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <card.icon className="h-4 w-4 text-amber-400" />
              {card.label}
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-100">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Per-caliber supply table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            Per-Caliber Token Supply
          </h3>
          <button
            type="button"
            onClick={() => void fetchStats()}
            title="Refresh stats"
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/50">
              <th className="px-6 py-3 font-medium text-zinc-400">Caliber</th>
              <th className="px-6 py-3 font-medium text-zinc-400">Name</th>
              <th className="px-6 py-3 font-medium text-zinc-400 text-right">
                Total Supply (rounds)
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.calibers.map((cal) => (
              <tr
                key={cal.caliber}
                className="border-b border-zinc-800/50 last:border-b-0"
              >
                <td className="px-6 py-3 font-mono text-sm text-zinc-200">
                  {cal.caliber}
                </td>
                <td className="px-6 py-3 text-zinc-300">{cal.name}</td>
                <td className="px-6 py-3 text-right font-mono text-zinc-200">
                  {cal.totalSupply.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
