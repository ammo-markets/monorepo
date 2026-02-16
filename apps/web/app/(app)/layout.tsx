"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected, isReconnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      router.replace("/");
    }
  }, [isConnected, isReconnecting, router]);

  // While reconnecting, show loading state
  if (isReconnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--border-default)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  // Not connected and not reconnecting — will redirect via useEffect
  if (!isConnected) {
    return null;
  }

  return <div className="min-h-screen">{children}</div>;
}
