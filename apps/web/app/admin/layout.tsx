import { AdminLayoutGate } from "@/features/admin/admin-layout-gate";
import { AdminSidebar } from "@/features/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
