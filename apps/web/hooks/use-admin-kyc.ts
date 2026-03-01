import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export interface AdminKycUser {
  id: string;
  walletAddress: string;
  kycStatus: string;
  kycFullName: string | null;
  kycDateOfBirth: string | null;
  kycState: string | null;
  kycGovIdType: string | null;
  kycGovIdNumber: string | null;
  kycRejectionReason: string | null;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
}

interface PaginatedKycResponse {
  users: AdminKycUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminKycParams {
  status?: string;
  search?: string;
  page?: number;
}

export function useAdminKycUsers(params: AdminKycParams = {}) {
  const { status, search, page = 1 } = params;

  return useQuery<PaginatedKycResponse>({
    queryKey: queryKeys.admin.kyc.list({ status, search, page }),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (status) searchParams.set("status", status);
      if (search) searchParams.set("search", search);

      const res = await fetch(`/api/admin/kyc?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch KYC submissions");
      return (await res.json()) as PaginatedKycResponse;
    },
    refetchInterval: 30_000,
  });
}

type KycAction =
  | { action: "APPROVE" }
  | { action: "REJECT"; rejectionReason: string };

export function useAdminKycAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      ...action
    }: KycAction & { userId: string }) => {
      const res = await fetch(`/api/admin/kyc/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Action failed",
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.kyc.all });
    },
  });
}
