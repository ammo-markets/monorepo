"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWaitForTransactionReceipt } from "wagmi";

type Status = "idle" | "requesting" | "confirming" | "done";

interface FaucetResponse {
  hash: `0x${string}`;
  error?: string;
  message?: string;
}

export function useAvaxFaucet(onSuccess?: () => void): {
  request: () => void;
  status: Status;
  error: string | null;
} {
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/faucet/avax", { method: "POST" });
      const data = (await res.json()) as FaucetResponse;

      if (!res.ok) {
        throw new Error(data.error ?? data.message ?? "Faucet request failed");
      }

      return data;
    },
    onSuccess: (data) => {
      setHash(data.hash);
    },
  });

  const { isSuccess: receiptSuccess, isError: receiptError } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receiptSuccess && hash) {
      onSuccess?.();
    }
  }, [receiptSuccess, hash, onSuccess]);

  const status: Status = useMemo(() => {
    if (receiptSuccess && hash) return "done";
    if (hash && !receiptError) return "confirming";
    if (mutation.isPending) return "requesting";
    return "idle";
  }, [mutation.isPending, hash, receiptSuccess, receiptError]);

  const error: string | null = useMemo(() => {
    if (mutation.error) return mutation.error.message;
    if (receiptError) return "Transaction failed";
    return null;
  }, [mutation.error, receiptError]);

  const request = useCallback(() => {
    if (status === "requesting" || status === "confirming") return;
    setHash(undefined);
    mutation.mutate();
  }, [status, mutation]);

  return { request, status, error };
}
