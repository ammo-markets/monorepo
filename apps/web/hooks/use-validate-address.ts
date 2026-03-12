import { useMutation } from "@tanstack/react-query";
import type { AddressValidationResult } from "@/app/api/address/validate/route";

export interface ValidateAddressInput {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: async (
      input: ValidateAddressInput,
    ): Promise<AddressValidationResult> => {
      const res = await fetch("/api/address/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Address validation failed");
      }

      return res.json();
    },
  });
}
