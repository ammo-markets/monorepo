"use client";

import { useEffect, useCallback } from "react";
import { DollarSign, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePayRedeem } from "@/hooks/use-pay-redeem";
import { useAllowance } from "@/hooks/use-allowance";
import { useWallet } from "@/hooks/use-wallet";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { formatUsdc } from "@/lib/tx-utils";
import { parseContractError } from "@/lib/errors";
import { contracts } from "@/lib/chain";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";

export function PayRedeemCard({ order }: { order: OrderFromAPI }) {
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const caliber = order.caliber as Caliber;
  const marketAddress = contracts.calibers[caliber].market;

  const shippingCost = order.shippingCost ? BigInt(order.shippingCost) : 0n;
  const protocolFee = order.protocolFee ? BigInt(order.protocolFee) : 0n;
  const totalCost = shippingCost + protocolFee;

  const allowance = useAllowance(contracts.usdc, wallet.address, marketAddress);
  const hasEnoughAllowance = allowance.hasEnoughAllowance(totalCost);

  const orderId = order.onChainOrderId ? BigInt(order.onChainOrderId) : undefined;

  const payTx = usePayRedeem(
    caliber,
    { orderId, totalCost: totalCost > 0n ? totalCost : undefined },
    { hasEnoughAllowance },
  );

  const errorMessage = parseContractError(
    payTx.approveError ?? payTx.payError ?? payTx.simulationError ?? payTx.payReceiptError ?? payTx.approveReceiptError,
  );

  // Refetch allowance after USDC approval
  useEffect(() => {
    if (payTx.isApproveConfirmed) {
      allowance.refetch();
      toast.success("USDT approved for payment");
    }
  }, [payTx.isApproveConfirmed, allowance.refetch]);

  // Refetch order after payment confirmed
  useEffect(() => {
    if (payTx.isPayConfirmed) {
      toast.success("Payment submitted! Order will update shortly.");
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    }
  }, [payTx.isPayConfirmed, order.id, queryClient]);

  // Toast on errors
  useEffect(() => {
    if (errorMessage) toast.error(errorMessage);
  }, [errorMessage]);

  const handleClick = useCallback(() => {
    if (!hasEnoughAllowance) {
      payTx.approveUsdc();
    } else {
      payTx.payRedeem();
    }
  }, [hasEnoughAllowance, payTx]);

  const isBusy =
    payTx.isApprovePending ||
    payTx.isApproveConfirming ||
    payTx.isPayPending ||
    payTx.isPayConfirming;

  const buttonLabel = payTx.isPayConfirmed
    ? "Payment Confirmed"
    : payTx.isPayConfirming
      ? "Confirming Payment..."
      : payTx.isPayPending
        ? "Confirm in Wallet..."
        : payTx.isApproveConfirming
          ? "Confirming Approval..."
          : payTx.isApprovePending
            ? "Approve in Wallet..."
            : !hasEnoughAllowance
              ? "Approve & Pay"
              : "Pay Now";

  return (
    <div
      className="mb-6 rounded-xl p-6 sm:p-8"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: payTx.isPayConfirmed
          ? "1px solid var(--green)"
          : "1px solid var(--amber)",
      }}
    >
      <div className="flex items-start gap-3">
        <DollarSign
          size={20}
          className="mt-0.5 shrink-0"
          style={{ color: payTx.isPayConfirmed ? "var(--green)" : "var(--amber)" }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {payTx.isPayConfirmed ? "Payment Complete" : "Payment Required"}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {payTx.isPayConfirmed
              ? "Your payment has been confirmed. The order will be shipped soon."
              : "Pay the shipping cost and protocol fee to proceed with your redemption."}
          </p>

          {/* Cost breakdown */}
          <div
            className="mt-4 rounded-lg px-4 py-3"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>Shipping</span>
              <span className="font-mono tabular-nums">${formatUsdc(shippingCost)} USDT</span>
            </div>
            {protocolFee > 0n && (
              <div className="mt-1.5 flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>Protocol Fee</span>
                <span className="font-mono tabular-nums">${formatUsdc(protocolFee)} USDT</span>
              </div>
            )}
            <div
              className="mt-2 flex justify-between border-t pt-2 text-sm font-medium"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border-default)",
              }}
            >
              <span>Total</span>
              <span className="font-mono tabular-nums">${formatUsdc(totalCost)} USDT</span>
            </div>
          </div>

          {/* Error */}
          {errorMessage && !isBusy && (
            <div className="mt-3 flex items-start gap-2 text-xs" style={{ color: "var(--red)" }}>
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action button */}
          {!payTx.isPayConfirmed && (
            <button
              type="button"
              onClick={handleClick}
              disabled={isBusy || (!payTx.isReady && hasEnoughAllowance)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-150 disabled:opacity-50"
              style={{
                backgroundColor: "var(--brass)",
                color: "var(--bg-primary)",
              }}
            >
              {isBusy && <Loader2 size={16} className="animate-spin" />}
              {buttonLabel}
            </button>
          )}

          {payTx.isPayConfirmed && payTx.payHash && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--green)" }}>
                <Check size={14} />
                Transaction confirmed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
