"use client";

import { useActivity } from "@/hooks/use-activity";
import type { ActivityItem } from "@/hooks/use-activity";

function truncateAddress(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function TypeBadge({ type }: { type: "MINT" | "REDEEM" }) {
  const isMint = type === "MINT";
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: isMint
          ? "rgba(46, 204, 113, 0.12)"
          : "rgba(243, 156, 18, 0.12)",
        color: isMint ? "var(--green)" : "var(--amber)",
      }}
    >
      {isMint ? "Mint" : "Redeem"}
    </span>
  );
}

export function ActivityFeed() {
  const { data: activity = [], isLoading: loading, error } = useActivity();

  return (
    <div>
      <h2
        className="mb-4 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        Recent Activity
      </h2>
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {error ? (
          <div className="px-4 py-8 text-center">
            <span className="text-sm" style={{ color: "var(--red)" }}>
              Failed to load activity
            </span>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full rounded shimmer" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              No recent activity
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Type
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Amount
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Address
                  </th>
                  <th
                    className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        i < activity.length - 1
                          ? "1px solid var(--border-default)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3">
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-sm tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.type === "MINT"
                          ? `${(Number(item.amount) / 1e6).toFixed(2)} USDC`
                          : `${Math.floor(Number(item.amount) / 1e18).toLocaleString("en-US")} rounds`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {truncateAddress(item.walletAddress)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {relativeTime(item.updatedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
