import { ArrowUpCircle } from "lucide-react";
import { MintOrdersTable } from "@/features/admin/mint-orders-table";

export default function MintOrdersPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ArrowUpCircle className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-zinc-100">
          Pending Mint Orders
        </h1>
      </div>
      <p className="mt-2 mb-6 text-sm text-zinc-400">
        Review and finalize pending mint orders from users.
      </p>
      <MintOrdersTable />
    </div>
  );
}
