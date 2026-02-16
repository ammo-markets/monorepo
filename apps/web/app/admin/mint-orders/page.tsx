import { ArrowUpCircle } from "lucide-react";
import { MintOrdersTable } from "@/features/admin/mint-orders-table";

export default function MintOrdersPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ArrowUpCircle className="h-6 w-6" style={{ color: "var(--brass)" }} />
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Pending Mint Orders
        </h1>
      </div>
      <p
        className="mt-2 mb-6 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Review and finalize pending mint orders from users.
      </p>
      <MintOrdersTable />
    </div>
  );
}
