"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { snowtraceUrl, snowtraceAddressUrl, formatDate } from "@/lib/utils";
import { FinalizeMintDialog } from "./finalize-mint-dialog";
import { FinalizeRedeemDialog } from "./finalize-redeem-dialog";
import { RejectMintDialog } from "./reject-mint-dialog";
import { CancelRedeemDialog } from "./cancel-redeem-dialog";
import type { AdminMintOrder } from "./finalize-mint-dialog";
import type { AdminRedeemOrder } from "./finalize-redeem-dialog";

type OrderDetailDrawerProps = {
  order: AdminMintOrder | AdminRedeemOrder | null;
  type: "MINT" | "REDEEM";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    PROCESSING: "bg-blue-900/30 text-blue-400 border-blue-800",
    COMPLETED: "bg-green-900/30 text-green-400 border-green-800",
    FAILED: "bg-red-900/30 text-red-400 border-red-800",
    CANCELLED: "bg-red-900/30 text-red-400 border-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${styles[status] ?? "bg-gray-900/30 text-gray-400 border-gray-800"}`}
    >
      {status}
    </span>
  );
}

function KycBadge({ status }: { status: string }) {
  const semantic: Record<string, string> = {
    APPROVED: "bg-green-900/30 text-green-400 border-green-800",
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  };

  const semanticStyle = semantic[status];

  if (semanticStyle) {
    return (
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${semanticStyle}`}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        color: "var(--text-muted)",
        borderColor: "var(--border-hover)",
      }}
    >
      {status}
    </span>
  );
}

function formatUsdc(amount: string): string {
  return (Number(amount) / 1e6).toFixed(2);
}

function formatTokenAmount(amount: string): string {
  return Math.floor(Number(amount) / 1e18).toLocaleString();
}

function isRedeemOrder(
  order: AdminMintOrder | AdminRedeemOrder,
): order is AdminRedeemOrder {
  return "shippingAddress" in order;
}

function TimelineStep({
  label,
  timestamp,
  dotColor,
  isLast,
  isActive,
}: {
  label: string;
  timestamp?: string;
  dotColor: string;
  isLast: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 ${isActive ? "" : "opacity-40"}`}
          style={{
            borderColor: dotColor,
            backgroundColor: isActive ? dotColor : "transparent",
          }}
        />
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-6"
            style={{
              backgroundColor: isActive
                ? "var(--border-hover)"
                : "var(--border-default)",
            }}
          />
        )}
      </div>
      <div className="pb-4">
        <p
          className="text-sm font-medium"
          style={{
            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
          }}
        >
          {label}
        </p>
        {timestamp && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderTimeline({
  order,
}: {
  order: AdminMintOrder | AdminRedeemOrder;
}) {
  const status = order.status;

  if (status === "COMPLETED") {
    return (
      <div>
        <TimelineStep
          label="Order Created"
          timestamp={order.createdAt}
          dotColor="var(--brass)"
          isLast={false}
          isActive
        />
        <TimelineStep
          label="Processing"
          dotColor="var(--brass)"
          isLast={false}
          isActive
        />
        <TimelineStep
          label="Completed"
          timestamp={order.updatedAt}
          dotColor="rgb(74 222 128)"
          isLast
          isActive
        />
      </div>
    );
  }

  if (status === "CANCELLED" || status === "FAILED") {
    return (
      <div>
        <TimelineStep
          label="Order Created"
          timestamp={order.createdAt}
          dotColor="var(--brass)"
          isLast={false}
          isActive
        />
        <TimelineStep
          label={status === "CANCELLED" ? "Cancelled" : "Failed"}
          timestamp={order.updatedAt}
          dotColor="rgb(248 113 113)"
          isLast
          isActive
        />
      </div>
    );
  }

  if (status === "PROCESSING") {
    return (
      <div>
        <TimelineStep
          label="Order Created"
          timestamp={order.createdAt}
          dotColor="var(--brass)"
          isLast={false}
          isActive
        />
        <TimelineStep
          label="Processing"
          dotColor="var(--brass)"
          isLast={false}
          isActive
        />
        <TimelineStep
          label="Completed"
          dotColor="rgb(74 222 128)"
          isLast
          isActive={false}
        />
      </div>
    );
  }

  // PENDING
  return (
    <div>
      <TimelineStep
        label="Order Created"
        timestamp={order.createdAt}
        dotColor="var(--brass)"
        isLast={false}
        isActive
      />
      <TimelineStep
        label="Processing"
        dotColor="var(--brass)"
        isLast={false}
        isActive={false}
      />
      <TimelineStep
        label="Completed"
        dotColor="rgb(74 222 128)"
        isLast
        isActive={false}
      />
    </div>
  );
}

export function OrderDetailDrawer({
  order,
  type,
  open,
  onOpenChange,
  onActionComplete,
}: OrderDetailDrawerProps) {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!order) return null;

  const isPending = order.status === "PENDING";
  const hasOnChainId = !!order.onChainOrderId;

  function handleActionDone() {
    onActionComplete();
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="mb-2">
              <StatusBadge status={order.status} />
            </div>
            <SheetTitle>
              {type === "MINT" ? "Mint Order" : "Redeem Order"}
            </SheetTitle>
            <SheetDescription className="font-mono text-xs break-all">
              {order.id}
            </SheetDescription>
          </SheetHeader>

          {/* Details section */}
          <div className="flex-1 space-y-6 px-4">
            {/* Key-value details */}
            <div className="space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span style={{ color: "var(--text-secondary)" }}>Wallet</span>
                  {order.walletAddress ? (
                    <a
                      href={snowtraceAddressUrl(order.walletAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs hover:underline"
                      style={{ color: "var(--brass)" }}
                    >
                      {order.walletAddress}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>N/A</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Caliber
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {order.caliber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {type === "MINT" ? "USDT Amount" : "Token Amount"}
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {type === "MINT"
                      ? `${formatUsdc(order.usdcAmount ?? "0")} USDT`
                      : `${formatTokenAmount(order.tokenAmount ?? "0")} rounds`}
                  </span>
                </div>

                {order.onChainOrderId && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>
                      On-chain ID
                    </span>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.onChainOrderId}
                    </span>
                  </div>
                )}

                {order.txHash && (
                  <div className="flex justify-between gap-2">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Tx Hash
                    </span>
                    <a
                      href={snowtraceUrl(order.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs hover:underline"
                      style={{ color: "var(--brass)" }}
                    >
                      {order.txHash.slice(0, 10)}...{order.txHash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Created
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Updated
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatDate(order.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mint-specific details */}
            {type === "MINT" && (
              <div className="space-y-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Mint Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-secondary)" }}>
                      KYC Status
                    </span>
                    <div className="flex items-center gap-2">
                      <KycBadge
                        status={order.user?.kycStatus ?? "NONE"}
                      />
                      {order.user?.kycFullName && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {order.user.kycFullName}
                          {order.user.kycState
                            ? `, ${order.user.kycState}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {(order as AdminMintOrder).mintPrice != null && (
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Mint Price
                      </span>
                      <span
                        className="font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        $
                        {(
                          Number((order as AdminMintOrder).mintPrice) / 1e6
                        ).toFixed(4)}
                      </span>
                    </div>
                  )}

                  {(order as AdminMintOrder).refundAmount != null &&
                    (order as AdminMintOrder).refundAmount !== "0" && (
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Refund Amount
                      </span>
                      <span
                        className="font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {(order as AdminMintOrder).refundAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Redeem-specific details */}
            {type === "REDEEM" && isRedeemOrder(order) && (
              <div className="space-y-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Redeem Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-secondary)" }}>
                      KYC Status
                    </span>
                    <div className="flex items-center gap-2">
                      <KycBadge status={order.user?.kycStatus ?? "NONE"} />
                      {order.user?.kycFullName && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {order.user.kycFullName}
                          {order.user.kycState
                            ? `, ${order.user.kycState}`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Shipping
                    </span>
                    <span
                      className="text-right text-xs"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.shippingAddress
                        ? `${order.shippingAddress.name}, ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`
                        : "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Timeline
              </h3>
              <OrderTimeline order={order} />
            </div>
          </div>

          {/* Footer actions */}
          {isPending && (
            <SheetFooter
              className="flex-row gap-3 border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <button
                type="button"
                disabled={!hasOnChainId}
                onClick={() => setFinalizeOpen(true)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-brass-hover disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "var(--brass)",
                  color: "var(--bg-primary)",
                }}
              >
                Finalize
              </button>
              <button
                type="button"
                disabled={!hasOnChainId}
                onClick={() => setRejectOpen(true)}
                className="flex-1 rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {type === "MINT" ? "Reject" : "Cancel"}
              </button>
            </SheetFooter>
          )}

          {!isPending && (
            <SheetFooter
              className="border-t"
              style={{ borderColor: "var(--border-default)" }}
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-ax-tertiary"
                style={{
                  borderColor: "var(--border-hover)",
                  color: "var(--text-primary)",
                }}
              >
                Close
              </button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      {type === "MINT" && (
        <>
          <FinalizeMintDialog
            order={order as AdminMintOrder}
            open={finalizeOpen}
            onOpenChange={setFinalizeOpen}
            onFinalized={handleActionDone}
          />
          <RejectMintDialog
            order={order as AdminMintOrder}
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            onRejected={handleActionDone}
          />
        </>
      )}

      {type === "REDEEM" && (
        <>
          <FinalizeRedeemDialog
            order={order as AdminRedeemOrder}
            open={finalizeOpen}
            onOpenChange={setFinalizeOpen}
            onFinalized={handleActionDone}
          />
          <CancelRedeemDialog
            order={order as AdminRedeemOrder}
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            onCancelled={handleActionDone}
          />
        </>
      )}
    </>
  );
}
