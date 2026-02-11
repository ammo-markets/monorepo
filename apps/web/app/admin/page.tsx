import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-zinc-100">Admin Dashboard</h1>
      </div>
      <p className="mt-2 text-sm text-zinc-400">
        Protocol stats coming soon. Use the sidebar to view pending orders.
      </p>
    </div>
  );
}
