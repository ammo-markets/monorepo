import Link from "next/link";
import { Check, XCircle, ExternalLink } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { snowtraceUrl, truncateAddress } from "@/lib/utils";
import { GhostButton } from "@/features/shared";

export function StepConfirmation({
  caliber,
  usdcAmount,
  isError,
  errorMessage,
  txHash,
  onMintMore,
  onRetry,
}: {
  caliber: CaliberDetailData;
  usdcAmount: string;
  isError: boolean;
  errorMessage: string;
  txHash: `0x${string}` | undefined;
  onMintMore: () => void;
  onRetry: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const usdcValue = Number.parseFloat(usdcAmount) || 0;
  const fee = usdcValue * (caliber.mintFee / 100);
  const netUsdc = usdcValue - fee;
  const estimatedRounds = Math.floor(netUsdc / caliber.price);

  if (isError) {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Error icon */}
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(231, 76, 60, 0.15)",
            border: "2px solid var(--red)",
          }}
        >
          <XCircle size={32} style={{ color: "var(--red)" }} />
        </div>
        <h2
          className="mb-2 font-display text-2xl font-bold uppercase"
          style={{ color: "var(--red)" }}
        >
          Transaction Failed
        </h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          {errorMessage || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success icon */}
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--brass-muted)",
          border: "2px solid var(--brass)",
        }}
      >
        <Check size={32} strokeWidth={3} style={{ color: "var(--brass)" }} />
      </div>

      <h2
        className="mb-1 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--brass)" }}
      >
        Mint Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Your tokens will be delivered to your wallet once the order is
        processed.
      </p>

      {/* Order details card */}
      <div
        className="w-full p-5 text-left"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="flex flex-col gap-3 text-sm">
          <div
            className="flex items-center gap-3 pb-3"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            <Icon size={28} />
            <div>
              <div
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                ~{estimatedRounds.toLocaleString("en-US")} {caliber.symbol}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {usdcValue.toFixed(2)} USDT
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Order ID</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Pending indexing
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Transaction</span>
            {txHash ? (
              <a
                href={snowtraceUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs font-medium transition-none"
                style={{ color: "var(--brass)" }}
              >
                {truncateAddress(txHash)}
                <ExternalLink size={12} />
              </a>
            ) : (
              <span
                className="font-mono text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                --
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>
              Estimated delivery
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              24-48 hours
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Status</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: "rgba(243, 156, 18, 0.15)",
                color: "var(--amber)",
              }}
            >
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex w-full flex-col gap-3">
        <Link
          href="/portfolio"
          className="flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          View in Portfolio
        </Link>
        <GhostButton onClick={onMintMore}>Mint More</GhostButton>
      </div>
    </div>
  );
}
