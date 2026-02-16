"use client";

import Link from "next/link";
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin-stats";

export function ProtocolStats() {
  const { data: stats, isLoading: loading, error, refetch } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-6"
              style={{
                borderColor: "var(--border-default)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              <div
                className="mb-3 h-4 w-20 rounded"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
              <div
                className="h-8 w-24 rounded"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
            </div>
          ))}
        </div>
        {/* Skeleton table */}
        <div
          className="animate-pulse rounded-lg border p-6"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div
            className="mb-4 h-4 w-32 rounded"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-full rounded"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-12"
        style={{ color: "var(--text-secondary)" }}
      >
        <p>{error ? "Failed to load stats" : "Failed to load stats"}</p>
        <button
          type="button"
          onClick={() => void refetch()}
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

  const pendingMintHighlight = stats.pendingMints > 0;
  const pendingRedeemHighlight = stats.pendingRedeems > 0;

  function StatCard({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
  }) {
    return (
      <div
        className="rounded-lg border p-6"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <Icon className="h-4 w-4" style={{ color: "var(--brass)" }} />
          {label}
        </div>
        <p
          className="mt-2 text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
    );
  }

  function PendingCard({
    label,
    value,
    icon: Icon,
    href,
    highlighted,
  }: {
    label: string;
    value: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    href: string;
    highlighted: boolean;
  }) {
    return (
      <Link
        href={href}
        className="block cursor-pointer rounded-lg border p-6 transition-colors hover:bg-[var(--bg-tertiary)]"
        style={{
          borderColor: highlighted ? "var(--brass)" : "var(--border-default)",
          boxShadow: highlighted ? "0 0 0 1px var(--brass)" : "none",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <Icon className="h-4 w-4" style={{ color: "var(--brass)" }} />
          {label}
        </div>
        <p
          className="mt-2 text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Treasury Balance"
          value={`$${Number(stats.treasuryUsdc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`}
          icon={DollarSign}
        />
        <PendingCard
          label="Pending Mints"
          value={stats.pendingMints.toLocaleString()}
          icon={ArrowUpCircle}
          href="/admin/mint-orders"
          highlighted={pendingMintHighlight}
        />
        <PendingCard
          label="Pending Redeems"
          value={stats.pendingRedeems.toLocaleString()}
          icon={ArrowDownCircle}
          href="/admin/redeem-orders"
          highlighted={pendingRedeemHighlight}
        />
        <StatCard
          label="Completed Mints"
          value={stats.totalMinted.toLocaleString()}
          icon={ArrowUpCircle}
        />
        <StatCard
          label="Completed Redeems"
          value={stats.totalRedeemed.toLocaleString()}
          icon={ArrowDownCircle}
        />
      </div>

      {/* Per-caliber supply table */}
      <div
        className="rounded-lg border"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--border-default)" }}
        >
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Per-Caliber Token Supply
          </h3>
          <button
            type="button"
            onClick={() => void refetch()}
            title="Refresh stats"
            className="transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-muted)" }}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--border-default)" }}
            >
              <th
                className="px-6 py-3 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Caliber
              </th>
              <th
                className="px-6 py-3 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Name
              </th>
              <th
                className="px-6 py-3 font-medium text-right"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Supply (rounds)
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.calibers.map((cal) => (
              <tr
                key={cal.caliber}
                className="border-b last:border-b-0"
                style={{ borderColor: "var(--border-default)" }}
              >
                <td
                  className="px-6 py-3 font-mono text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cal.caliber}
                </td>
                <td
                  className="px-6 py-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cal.name}
                </td>
                <td
                  className="px-6 py-3 text-right font-mono"
                  style={{ color: "var(--text-primary)" }}
                >
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
