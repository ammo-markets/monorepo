import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { publicClient } from "@/lib/viem";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import { AdminLayoutGate } from "@/features/admin/admin-layout-gate";
import { AdminSidebar } from "@/features/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check — non-authenticated users see 404
  const session = await getSession();

  if (!session.siwe) {
    notFound();
  }

  // Server-side keeper check — non-keepers see 404
  const isKeeper = await publicClient.readContract({
    address: CONTRACT_ADDRESSES.fuji.manager,
    abi: AmmoManagerAbi,
    functionName: "isKeeper",
    args: [session.siwe.address as `0x${string}`],
  });

  if (!isKeeper) {
    notFound();
  }

  // AdminLayoutGate remains as client-side fallback for loading/hydration states
  return (
    <AdminLayoutGate>
      <div className="flex h-screen flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminLayoutGate>
  );
}
