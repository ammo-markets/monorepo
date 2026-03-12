import { useMutation } from "@tanstack/react-query";

interface DefaultShippingInput {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export function useSaveDefaultShipping() {
  return useMutation({
    mutationFn: async (input: DefaultShippingInput) => {
      const res = await fetch("/api/user/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to save default shipping");
      }

      return res.json();
    },
  });
}
