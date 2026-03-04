"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
} from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { useAdminKycUsers } from "@/hooks/use-admin-kyc";
import type { AdminKycUser } from "@/hooks/use-admin-kyc";
import { KycDetailDrawer } from "./kyc-detail-drawer";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "All", value: "" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

function KycStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    APPROVED: "bg-green-900/30 text-green-400 border-green-800",
    REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-900/30 text-gray-400 border-gray-800"}`}
    >
      {status}
    </span>
  );
}

export function KycUsersTable() {
  const [drawerUser, setDrawerUser] = useState<AdminKycUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const { data, isLoading, error, refetch } = useAdminKycUsers({
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
    page: currentPage,
  });

  const users = data?.users;
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const pageStart =
    users && users.length > 0 ? (currentPage - 1) * 20 + 1 : 0;
  const pageEnd = users ? pageStart + users.length - 1 : 0;

  return (
    <>
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search by wallet or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
            style={{
              borderColor: "var(--border-hover)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-brass focus:ring-1 focus:ring-brass"
          style={{
            borderColor: "var(--border-hover)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-12"
          style={{ color: "var(--text-secondary)" }}
        >
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-12"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>Failed to load KYC submissions</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-ax-tertiary"
            style={{
              borderColor: "var(--border-hover)",
              color: "var(--text-primary)",
            }}
          >
            Retry
          </button>
        </div>
      ) : !users || users.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12"
          style={{ color: "var(--text-muted)" }}
        >
          <Inbox className="h-8 w-8" />
          <p className="text-sm">
            {debouncedSearch || statusFilter
              ? "No submissions match your filters"
              : "No KYC submissions"}
          </p>
        </div>
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-xl border"
            style={{ borderColor: "var(--border-default)" }}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: "var(--border-default)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Wallet
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full Name
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    State
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ID Type
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Submitted
                  </th>
                  <th
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer border-b transition-colors hover:bg-ax-secondary"
                    style={{ borderColor: "var(--border-default)" }}
                    onClick={() => {
                      setDrawerUser(user);
                      setDrawerOpen(true);
                    }}
                  >
                    <td
                      className="px-4 py-3 font-mono text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {truncateAddress(user.walletAddress)}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.kycFullName ?? "N/A"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.kycState ?? "N/A"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.kycGovIdType ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <KycStatusBadge status={user.kycStatus} />
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {user.kycSubmittedAt
                        ? formatDistanceToNow(new Date(user.kycSubmittedAt), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {user.kycStatus === "PENDING" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerUser(user);
                            setDrawerOpen(true);
                          }}
                          className="rounded-md px-3 py-1 text-xs font-medium transition-colors hover:bg-brass-hover"
                          style={{
                            backgroundColor: "var(--brass)",
                            color: "var(--bg-primary)",
                          }}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="mt-4 flex items-center justify-between text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>
              Showing {pageStart}-{pageEnd} of {total} submissions
            </span>
            <div className="flex items-center gap-3">
              <span style={{ color: "var(--text-muted)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md border p-1.5 transition-colors hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--border-hover)" }}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md border p-1.5 transition-colors hover:bg-ax-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--border-hover)" }}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
      <KycDetailDrawer
        user={drawerUser}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDrawerUser(null);
        }}
      />
    </>
  );
}
