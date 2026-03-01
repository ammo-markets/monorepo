import { ShieldCheck } from "lucide-react";
import { KycUsersTable } from "@/features/admin/kyc-users-table";

export default function AdminKycPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ShieldCheck
          className="h-6 w-6"
          style={{ color: "var(--brass)" }}
        />
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          KYC Reviews
        </h1>
      </div>
      <p
        className="mt-2 mb-6 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Review and manage user identity verification submissions.
      </p>
      <KycUsersTable />
    </div>
  );
}
