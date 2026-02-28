"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useSearchParams } from "next/navigation";
import { formatUnits } from "viem";
import { buildAllCaliberDetails } from "@/lib/caliber-utils";
import { MintProgress } from "./mint-progress";
import type { MintTxStatus } from "@/hooks/use-tx-status";
import { useTxStatus } from "@/hooks/use-tx-status";

import { useWallet } from "@/hooks/use-wallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMintTransaction } from "@/hooks/use-mint-transaction";
import { useAllowance } from "@/hooks/use-allowance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { parseContractError } from "@/lib/errors";
import { getDeadline, parseUsdc } from "@/lib/tx-utils";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

import { StepSelectCaliber } from "./steps/step-select-caliber";
import { StepEnterAmount } from "./steps/step-enter-amount";
import { StepReview } from "./steps/step-review";
import { StepConfirmation } from "./steps/step-confirmation";

export function MintFlow({
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

  const [step, setStep] = useState(() => {
    if (preselected) return 1;
    return 0;
  });
  const [selectedCaliber, setSelectedCaliber] = useState<Caliber | null>(() => {
    if (preselected) return preselected;
    return null;
  });
  const [usdcAmount, setUsdcAmount] = useState("");
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [slippageBps, setSlippageBps] = useState(100);

  const activeCaliber: Caliber = selectedCaliber ?? "9MM";
  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;

  // ── Real hooks ──
  const wallet = useWallet();
  const { openConnectModal } = useConnectModal();
  const { usdc: usdcBalanceRaw } = useTokenBalances();
  const marketAddress = contracts.calibers[activeCaliber].market;
  const allowance = useAllowance(
    contracts.usdc,
    wallet.address,
    marketAddress,
  );

  // ── Format real USDC balance (6 decimals -> number) ──
  const usdcBalance = useMemo(() => {
    if (usdcBalanceRaw === undefined) return 0;
    return Number(formatUnits(usdcBalanceRaw, 6));
  }, [usdcBalanceRaw]);

  // ── Derive allowance check ──
  const parsedUsdcAmount = useMemo(
    () => parseUsdc(usdcAmount || "0"),
    [usdcAmount],
  );
  const hasEnoughAllowance = allowance.hasEnoughAllowance(parsedUsdcAmount);

  const mintTx = useMintTransaction(
    activeCaliber,
    {
      usdcAmount: parsedUsdcAmount > BigInt(0) ? parsedUsdcAmount : undefined,
      slippageBps: BigInt(slippageBps),
      deadline: getDeadline(deadlineHours),
    },
    { hasEnoughAllowance },
  );

  // ── Derive TxStatus from hook states ──
  const txStatus: MintTxStatus = useTxStatus({
    flags: {
      isActionConfirmed: mintTx.isMintConfirmed,
      isActionConfirming: mintTx.isMintConfirming,
      isActionPending: mintTx.isMintPending,
      isApproveConfirmed: mintTx.isApproveConfirmed,
      isApproveConfirming: mintTx.isApproveConfirming,
      isApprovePending: mintTx.isApprovePending,
      approveError: mintTx.approveError,
      actionError: mintTx.mintError,
      receiptError: mintTx.mintReceiptError ?? mintTx.approveReceiptError,
      simulationError: mintTx.simulationError,
    },
    actionStatus: "minting",
    actionConfirmingStatus: "mint-confirming",
    hasEnoughAllowance,
  });

  const errorMessage = parseContractError(
    mintTx.approveError ||
      mintTx.mintError ||
      mintTx.simulationError ||
      mintTx.mintReceiptError ||
      mintTx.approveReceiptError,
  );

  // ── Refetch allowance after approval so simulation can run ──
  useEffect(() => {
    if (mintTx.isApproveConfirmed) {
      allowance.refetch();
    }
  }, [mintTx.isApproveConfirmed, allowance.refetch]);

  // ── Auto-advance to confirmation when mint confirmed ──
  useEffect(() => {
    if (mintTx.isMintConfirmed) {
      setStep(3);
    }
  }, [mintTx.isMintConfirmed]);

  // ── Scroll to top on step change (focus on active step) ──
  useEffect(() => {
    const baseStep = isEmbedded ? 1 : 0;
    if (step > baseStep && containerRef.current) {
      // Small timeout to allow render before scrolling
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  }, [step, isEmbedded]);

  // ── Handlers ──
  const handleApprove = useCallback(() => {
    mintTx.approve(usdcAmount);
  }, [mintTx, usdcAmount]);

  const handleConfirm = useCallback(() => {
    mintTx.startMint();
  }, [mintTx]);

  const handleRetry = useCallback(() => {
    mintTx.reset();
  }, [mintTx]);

  const handleMintMore = useCallback(() => {
    mintTx.reset();
    if (isEmbedded) {
      setStep(1);
      setSelectedCaliber(preselected);
    } else {
      setStep(0);
      setSelectedCaliber(null);
    }
    setUsdcAmount("");
    setDeadlineHours(24);
  }, [mintTx, isEmbedded, preselected]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[560px] px-4 py-8 md:py-12"
    >
      <MintProgress
        currentStep={step}
        isEmbedded={isEmbedded}
        onStepClick={setStep}
      />

      {/* Loading skeleton while market data fetches */}
      {marketLoading && (
        <div className="mt-6">
          <div className="mb-6 h-6 w-48 rounded shimmer" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 shimmer" />
            ))}
          </div>
        </div>
      )}

      {step === 0 && !isEmbedded && !marketLoading && (
        <StepSelectCaliber
          selected={selectedCaliber}
          allCalibers={
            caliberDetailsMap ? Object.values(caliberDetailsMap) : []
          }
          onSelect={setSelectedCaliber}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && caliber && (
        <StepEnterAmount
          caliber={caliber}
          usdcAmount={usdcAmount}
          setUsdcAmount={setUsdcAmount}
          usdcBalance={usdcBalance}
          deadlineHours={deadlineHours}
          onDeadlineChange={setDeadlineHours}
          slippageBps={slippageBps}
          onSlippageChange={setSlippageBps}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
          hideBack={isEmbedded}
          isConnected={wallet.isConnected}
          onConnect={() => openConnectModal?.()}
        />
      )}

      {step === 2 && caliber && (
        <StepReview
          caliber={caliber}
          usdcAmount={usdcAmount}
          deadlineHours={deadlineHours}
          slippageBps={slippageBps}
          txStatus={txStatus}
          errorMessage={errorMessage}
          isConnected={wallet.isConnected}
          isWrongNetwork={wallet.isWrongNetwork}
          onConnect={() => openConnectModal?.()}
          onSwitchNetwork={wallet.switchNetwork}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && caliber && (
        <StepConfirmation
          caliber={caliber}
          usdcAmount={usdcAmount}
          isError={txStatus === "failed"}
          errorMessage={errorMessage}
          txHash={mintTx.mintHash}
          onMintMore={handleMintMore}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
