import { ArrowDownCircle } from "lucide-react";
import { RedeemOrdersTable } from "@/features/admin/redeem-orders-table";

export default function RedeemOrdersPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ArrowDownCircle className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-zinc-100">
          Pending Redeem Orders
        </h1>
      </div>
      <p className="mt-2 mb-6 text-sm text-zinc-400">
        Review pending redemption orders with KYC status and shipping details.
      </p>
      <RedeemOrdersTable />
    </div>
  );
}
