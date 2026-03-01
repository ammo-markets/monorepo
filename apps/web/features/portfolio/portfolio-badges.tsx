import type { OrderFromAPI } from "@/lib/types";

export type DisplayStatus = "Processing" | "Completed" | "Failed";

export function mapOrderStatus(status: OrderFromAPI["status"]): DisplayStatus {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
      return "Processing";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
    case "CANCELLED":
      return "Failed";
  }
}

export const statusColors: Record<DisplayStatus, string> = {
  Processing: "var(--blue)",
  Completed: "var(--green)",
  Failed: "var(--red)",
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const color = statusColors[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}

export function TypeBadge({ type }: { type: "MINT" | "REDEEM" }) {
  const label = type === "MINT" ? "Mint" : "Redeem";
  const color = type === "MINT" ? "var(--brass)" : "var(--amber)";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}
