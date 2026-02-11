import { LayoutDashboard } from "lucide-react";
import { ProtocolStats } from "@/features/admin/protocol-stats";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Admin Dashboard</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Protocol overview and management
        </p>
      </div>

      <ProtocolStats />
    </div>
  );
}
