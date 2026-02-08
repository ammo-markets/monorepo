import { recentActivity } from "@/lib/mock-data";

function TypeBadge({ type }: { type: "Mint" | "Redeem" }) {
  const isMint = type === "Mint";
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
      {type}
    </span>
  );
}

export function ActivityFeed() {
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
              {recentActivity.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      i < recentActivity.length - 1
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
                      {item.amount.toLocaleString("en-US")} rounds
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.timeAgo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
