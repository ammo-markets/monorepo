import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ProfileData } from "@/app/(app)/profile/profile-constants";

export function useProfile(enabled: boolean) {
  return useQuery<ProfileData | null>({
    queryKey: queryKeys.profile.all,
    queryFn: async () => {
      const res = await fetch("/api/users/profile");
      if (!res.ok) return null;
      return (await res.json()) as ProfileData;
    },
    enabled,
  });
}
