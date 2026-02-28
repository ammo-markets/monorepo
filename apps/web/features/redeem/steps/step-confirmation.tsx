import Link from "next/link";
import { Check, XCircle, ExternalLink } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { snowtraceUrl, truncateAddress } from "@/lib/utils";
import { PrimaryButton, GhostButton } from "@/features/shared";

export function StepConfirmation({
  caliber,
  roundsAmount,
  isError,
  errorMessage,
  redeemHash,
  onRedeemMore,
  onRetry,
}: {
  caliber: CaliberDetailData;
  roundsAmount: string;
  isError: boolean;
  errorMessage?: string;
  redeemHash: `0x${string}` | undefined;
  onRedeemMore: () => void;
  onRetry: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * 0.015);
  const netRounds = rounds - fee;

  if (isError) {
    return (
      <div className="flex flex-col items-center text-center">
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
        <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>
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
        Redemption Order Submitted!
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        {
          "Your tokens have been burned. You'll receive a tracking number via email once your order ships."
        }
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
                {netRounds.toLocaleString("en-US")} rounds shipping
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {rounds.toLocaleString("en-US")} {caliber.symbol} burned
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
            {redeemHash ? (
              <a
                href={snowtraceUrl(redeemHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs font-medium transition-none"
                style={{ color: "var(--brass)" }}
              >
                {truncateAddress(redeemHash)}
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
            <span style={{ color: "var(--text-muted)" }}>Tokens burned</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {rounds.toLocaleString("en-US")} {caliber.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>Rounds shipping</span>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {netRounds.toLocaleString("en-US")}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-muted)" }}>
              Estimated delivery
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              5-10 business days
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
              Processing
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
          Track Order
        </Link>
        <GhostButton onClick={onRedeemMore}>Redeem More</GhostButton>
      </div>
    </div>
  );
}
