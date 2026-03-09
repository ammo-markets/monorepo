import { ArrowDownCircle } from "lucide-react";
import { RedeemOrdersTable } from "@/features/admin/redeem-orders-table";

export default function RedeemOrdersPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ArrowDownCircle
          className="h-6 w-6"
          style={{ color: "var(--brass)" }}
        />
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Pending Redeem Orders
        </h1>
      </div>
      <p
        className="mt-2 mb-6 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Review pending redemption orders and shipping details.
      </p>
      <RedeemOrdersTable />
    </div>
  );
}
