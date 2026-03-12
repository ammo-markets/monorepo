"use client";

import { useMutation } from "@tanstack/react-query";

interface SaveCancelReasonInput {
  orderId: string;
  reason: string;
}

export function useSaveCancelReason() {
  return useMutation({
    mutationFn: async ({ orderId, reason }: SaveCancelReasonInput) => {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel-reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        throw new Error("Failed to save cancel reason");
      }
    },
  });
}
