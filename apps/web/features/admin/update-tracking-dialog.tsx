"use client";

import { useState } from "react";
import { X, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

const UPS_TRACKING_URL = "https://www.ups.com/track?loc=en_US&tracknum=";

interface UpdateTrackingDialogProps {
  order: AdminRedeemOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTrackingDialog({
  order,
  open,
  onOpenChange,
}: UpdateTrackingDialogProps) {
  const queryClient = useQueryClient();
  const [trackingId, setTrackingId] = useState(order.trackingId ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: { trackingId: string }) => {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to update tracking");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Tracking ID updated");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("REDEEM"),
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-6 shadow-xl"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: "var(--brass)" }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Update Tracking
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="transition-colors hover:text-text-primary"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Order ID</span>
            <span
              className="font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {order.id.slice(0, 8)}
            </span>
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              UPS Tracking Number
            </label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.trim())}
              placeholder="1Z999AA10123456784"
              className="w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono outline-none"
              style={{
                borderColor: "var(--border-hover)",
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {trackingId && (
            <a
              href={`${UPS_TRACKING_URL}${trackingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs transition-colors hover:underline"
              style={{ color: "var(--brass)" }}
            >
              <ExternalLink className="h-3 w-3" />
              Preview UPS tracking page
            </a>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-ax-tertiary"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutate({ trackingId })}
            disabled={!trackingId || isPending}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
          >
            {isPending ? "Saving..." : "Save Tracking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { UPS_TRACKING_URL };
