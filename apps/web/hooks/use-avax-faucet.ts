"use client";

import { useCallback, useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

type Status = "idle" | "requesting" | "confirming" | "done";

export function useAvaxFaucet(onSuccess?: () => void): {
  request: () => void;
  status: Status;
  error: string | null;
} {
  const [status, setStatus] = useState<Status>("idle");
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && status === "confirming") {
      setStatus("done");
      onSuccess?.();
    }
  }, [isSuccess, status, onSuccess]);

  useEffect(() => {
    if (isError && status === "confirming") {
      setError("Transaction failed");
      setStatus("idle");
    }
  }, [isError, status]);

  const request = useCallback(async () => {
    if (status === "requesting" || status === "confirming") return;

    setError(null);
    setStatus("requesting");

    try {
      const res = await fetch("/api/faucet/avax", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? data.message ?? "Faucet request failed");
        setStatus("idle");
        return;
      }

      setHash(data.hash);
      setStatus("confirming");
    } catch {
      setError("Network error");
      setStatus("idle");
    }
  }, [status]);

  return { request, status, error };
}
