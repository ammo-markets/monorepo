"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface SessionData {
  address: string | null;
}

export function useSession() {
  return useQuery<SessionData>({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return { address: null };
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
}
