import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { KycFormData } from "@/features/redeem/kyc-form";

interface KycPrefill {
  fullName: string | null;
  dateOfBirth: string | null;
  state: string | null;
  govIdType: string | null;
  govIdNumber: string | null;
}

interface KycStatusData {
  kycStatus: string;
  kycPrefill: KycPrefill | undefined;
}

export function useKycStatus(walletAddress: string | undefined) {
  return useQuery<KycStatusData>({
    queryKey: ["kyc", walletAddress],
    queryFn: async (): Promise<KycStatusData> => {
      try {
        const res = await fetch("/api/users/kyc");
        if (!res.ok) {
          throw new Error(`Failed to fetch KYC status (${res.status})`);
        }
        const data = await res.json();
        let dateOfBirth: string | null = null;
        if (data.kycDateOfBirth) {
          dateOfBirth =
            new Date(data.kycDateOfBirth as string)
              .toISOString()
              .split("T")[0] ?? null;
        }
        return {
          kycStatus: (data.kycStatus as string) ?? "NONE",
          kycPrefill: {
            fullName: (data.kycFullName as string | null) ?? null,
            dateOfBirth,
            state: (data.kycState as string | null) ?? null,
            govIdType: (data.kycGovIdType as string | null) ?? null,
            govIdNumber: (data.kycGovIdNumber as string | null) ?? null,
          },
        };
      } catch {
        return { kycStatus: "NONE", kycPrefill: undefined };
      }
    },
    enabled: !!walletAddress,
  });
}

export function useKycSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KycFormData) => {
      const res = await fetch("/api/users/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error ??
            `KYC submission failed (${res.status})`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
  });
}
