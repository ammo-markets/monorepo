import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveProfile<T extends object = Record<string, string>>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: T) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to save address");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
