"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useSearchParams } from "next/navigation";
import { buildAllCaliberDetails } from "@/lib/caliber-utils";
import { RedeemProgress } from "./redeem-progress";
import type { RedeemTxStatus } from "@/hooks/use-tx-status";
import { useTxStatus } from "@/hooks/use-tx-status";

import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRedeemTransaction } from "@/hooks/use-redeem-transaction";
import { useAllowance } from "@/hooks/use-allowance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { toast } from "sonner";
import { parseContractError } from "@/lib/errors";
import { getDeadline, parseTokenAmount } from "@/lib/tx-utils";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { useOrders } from "@/hooks/use-orders";

import { StepCompose } from "./steps/step-compose";
import { StepReviewAndConfirm } from "./steps/step-review-and-confirm";
import { StepShipping, type ShippingAddress } from "./steps/step-shipping";
import { StepConfirmation } from "./steps/step-confirmation";

export function RedeemFlow({
  selectedCaliber: caliberFromProp,
}: {
  selectedCaliber?: Caliber;
}) {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const preselected =
    caliberFromProp ??
    (searchParams.get("caliber")?.toUpperCase() as Caliber | null);
  const isEmbedded = preselected !== null;

  const { data: marketCalibers = [], isLoading: marketLoading } =
    useMarketData();

  const caliberDetailsMap = useMemo(() => {
    if (marketCalibers.length === 0) return null;
    return buildAllCaliberDetails(marketCalibers);
  }, [marketCalibers]);

  // Steps: 0 = Compose, 1 = Review, 2 = Shipping (Side), 3 = Confirmation
  const [step, setStep] = useState(0);
  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(() => {
    if (preselected) return preselected;
    return null;
  });
  const [roundsAmount, setRoundsAmount] = useState("");
  const [deadlineHours, setDeadlineHours] = useState(168);

  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;

  // ── Real hooks ──
  const activeCaliber: Caliber = selectedCaliber ?? "9MM_PRACTICE";
  const wallet = useWallet();
  const { openConnectModal } = useConnectModal();
  const balances = useTokenBalances();
  const { addPendingOrder } = usePendingOrders(wallet.address);

  // ── Pre-fill shipping from most recent redeem order ──
  const { data: pastOrders } = useOrders(wallet.address);

  const [localAddress, setLocalAddress] = useState<ShippingAddress>({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
  });

  const hasAddress = !!(
    localAddress.fullName &&
    localAddress.address1 &&
    localAddress.city &&
    localAddress.state &&
    localAddress.zip
  );

  // Pre-fill from most recent redeem order's shipping address
  const prefillApplied = useRef(false);
  useEffect(() => {
    if (prefillApplied.current || !pastOrders) return;
    const lastRedeem = pastOrders.find(
      (o) => o.type === "REDEEM" && o.shippingAddress,
    );
    if (lastRedeem?.shippingAddress) {
      const sa = lastRedeem.shippingAddress;
      setLocalAddress({
        fullName: sa.name,
        address1: sa.line1,
        address2: sa.line2 ?? "",
        city: sa.city,
        state: sa.state,
        zip: sa.zip,
      });
      prefillApplied.current = true;
    }
  }, [pastOrders]);

  const [ageVerified, setAgeVerified] = useState(false);

  const tokenAddress = contracts.calibers[activeCaliber].token;
  const marketAddress = contracts.calibers[activeCaliber].market;
  const allowance = useAllowance(tokenAddress, wallet.address, marketAddress);

  // ── Derive allowance check ──
  const parsedTokenAmount = useMemo(
    () => (roundsAmount ? parseTokenAmount(roundsAmount) : BigInt(0)),
    [roundsAmount],
  );
  const hasEnoughAllowance = roundsAmount
    ? allowance.hasEnoughAllowance(parsedTokenAmount)
    : false;

  const redeemTx = useRedeemTransaction(
    activeCaliber,
    {
      tokenAmount:
        parsedTokenAmount > BigInt(0) ? parsedTokenAmount : undefined,
      deadline: getDeadline(deadlineHours),
    },
    { hasEnoughAllowance },
  );

  // ── Derive TxStatus from hook states ──
  const txStatus: RedeemTxStatus = useTxStatus({
    flags: {
      isActionConfirmed: redeemTx.isRedeemConfirmed,
      isActionConfirming: redeemTx.isRedeemConfirming,
      isActionPending: redeemTx.isRedeemPending,
      isApproveConfirmed: redeemTx.isApproveConfirmed,
      isApproveConfirming: redeemTx.isApproveConfirming,
      isApprovePending: redeemTx.isApprovePending,
      approveError: redeemTx.approveError,
      actionError: redeemTx.redeemError,
      receiptError: redeemTx.redeemReceiptError ?? redeemTx.approveReceiptError,
      simulationError: redeemTx.simulationError,
    },
    actionStatus: "redeeming",
    actionConfirmingStatus: "redeem-confirming",
    hasEnoughAllowance,
  });

  const errorMessage = parseContractError(
    redeemTx.approveError ||
      redeemTx.redeemError ||
      redeemTx.simulationError ||
      redeemTx.redeemReceiptError ||
      redeemTx.approveReceiptError,
  );

  // ── Refetch allowance after approval so simulation can run ──
  useEffect(() => {
    if (redeemTx.isApproveConfirmed) {
      allowance.refetch();
      toast.success("Token approved");
    }
  }, [redeemTx.isApproveConfirmed, allowance.refetch]);

  // ── Auto-advance to confirmation when redeem confirmed ──
  useEffect(() => {
    if (redeemTx.isRedeemConfirmed) {
      setStep(3);
      toast.success(`Redeemed ${activeCaliber} tokens`);
      if (redeemTx.redeemHash) {
        addPendingOrder({
          type: "REDEEM",
          caliber: activeCaliber,
          tokenAmount: parsedTokenAmount.toString(),
          txHash: redeemTx.redeemHash,
        });
      }
    }
  }, [
    redeemTx.isRedeemConfirmed,
    activeCaliber,
    redeemTx.redeemHash,
    addPendingOrder,
    parsedTokenAmount,
  ]);

  // ── Auto-save shipping address once the order appears in DB ──
  const shippingSaved = useRef(false);
  useEffect(() => {
    if (shippingSaved.current || !redeemTx.redeemHash || !pastOrders) return;
    if (!localAddress.fullName || !localAddress.address1) return;

    const order = pastOrders.find(
      (o) => o.txHash === redeemTx.redeemHash && !o.id.startsWith("pending-"),
    );

    if (order) {
      shippingSaved.current = true;
      fetch("/api/redeem/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          walletAddress: wallet.address,
          name: localAddress.fullName,
          line1: localAddress.address1,
          line2: localAddress.address2 || undefined,
          city: localAddress.city,
          state: localAddress.state,
          zip: localAddress.zip,
        }),
      }).catch(() => {
        // Shipping save failed — user can update later
        shippingSaved.current = false;
      });
    }
  }, [pastOrders, redeemTx.redeemHash, localAddress, wallet.address]);

  // ── Toast on errors ──
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  // ── Scroll to top on step change (focus on active step) ──
  useEffect(() => {
    if (step > 0 && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  }, [step]);

  // ── Handlers ──
  function handleApprove() {
    redeemTx.approve(roundsAmount);
  }

  function handleConfirm() {
    redeemTx.startRedeem();
  }

  function handleRetry() {
    redeemTx.reset();
  }

  const handleRedeemMore = useCallback(() => {
    redeemTx.reset();
    setStep(0);
    if (isEmbedded) {
      setSelectedCaliber(preselected);
    } else {
      setSelectedCaliber(null);
    }
    setRoundsAmount("");
    setDeadlineHours(24);
  }, [redeemTx, isEmbedded, preselected]);

  // Visual Step computation for progress bar
  // 0 -> Compose (1)
  // 1, 2 -> Review (2)
  // 3 -> Confirm (3)
  const visualStep = step === 0 ? 0 : step === 3 ? 2 : 1;

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-xl px-4 py-8 md:py-12"
    >
      <RedeemProgress
        currentStep={visualStep}
        isEmbedded={isEmbedded}
        onStepClick={(visualIdx) => {
          // Map visual step index back to internal step: 0→0, 1→1
          if (visualIdx === 0) setStep(0);
          else if (visualIdx === 1) setStep(1);
        }}
      />

      {/* Loading skeleton while market data fetches */}
      {marketLoading && (
        <div className="mt-6">
          <div className="mb-6 h-6 w-52 rounded shimmer" />
          <div className="h-4 w-72 rounded shimmer mb-6" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 shimmer" />
            ))}
          </div>
        </div>
      )}

      {step === 0 && !marketLoading && (
        <StepCompose
          selectedCaliber={selectedCaliber}
          roundsAmount={roundsAmount}
          tokenBalances={balances.tokens}
          caliberDetailsMap={caliberDetailsMap}
          deadlineHours={deadlineHours}
          onDeadlineChange={setDeadlineHours}
          onSelectCaliber={setSelectedCaliber}
          setRoundsAmount={setRoundsAmount}
          onNext={() => setStep(1)}
          isEmbedded={isEmbedded}
          isConnected={wallet.isConnected}
          onConnect={() => openConnectModal?.()}
        />
      )}

      {step === 1 && caliber && (
        <StepReviewAndConfirm
          caliber={caliber}
          roundsAmount={roundsAmount}
          address={localAddress}
          hasAddress={hasAddress}
          deadlineHours={deadlineHours}
          txStatus={txStatus}
          errorMessage={errorMessage}
          isConnected={wallet.isConnected}
          hasEnoughAllowance={hasEnoughAllowance}
          onConnect={() => openConnectModal?.()}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
          onBack={() => setStep(0)}
          onGoToShipping={() => setStep(2)}
        />
      )}

      {step === 2 && caliber && (
        <StepShipping
          address={localAddress}
          setAddress={setLocalAddress}
          ageVerified={ageVerified}
          setAgeVerified={setAgeVerified}
          caliber={caliber}
          onNext={() => setStep(1)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && caliber && (
        <StepConfirmation
          caliber={caliber}
          roundsAmount={roundsAmount}
          isError={txStatus === "failed"}
          errorMessage={errorMessage}
          redeemHash={redeemTx.redeemHash}
          onRedeemMore={handleRedeemMore}
          onRetry={() => {
            redeemTx.reset();
            setStep(1);
          }}
        />
      )}
    </div>
  );
}
