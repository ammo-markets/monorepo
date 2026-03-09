import { ArrowLeft, Check, Wallet, ChevronDown } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";

function UsdcIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="#26A17B"
        strokeWidth="1.5"
        fill="rgba(52, 152, 219, 0.1)"
      />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="#26A17B"
        fontSize="12"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

export function StepEnterAmount({
  caliber,
  usdcAmount,
  setUsdcAmount,
  usdcBalance,
  onNext,
  onBack,
  hideBack,
  isConnected,
  onConnect,
}: {
  caliber: CaliberDetailData;
  usdcAmount: string;
  setUsdcAmount: (val: string) => void;
  usdcBalance: number;
  onNext: () => void;
  onBack: () => void;
  hideBack?: boolean;
  isConnected: boolean;
  onConnect: () => void;
}) {
  const Icon = caliberIcons[caliber.id];
  const quickAmounts = [50, 100, 250, 500];
  const usdcValue = Number.parseFloat(usdcAmount) || 0;
  const fee = usdcValue * (caliber.mintFee / 100);
  const netUsdc = usdcValue - fee;
  const estimatedRounds = Math.floor(netUsdc / caliber.price);
  const exceedsBalance = usdcValue > usdcBalance;
  const isValid = usdcValue > 0 && !exceedsBalance;
  const hasError = exceedsBalance;

  return (
    <div>
      {/* Back */}
      {!hideBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-none text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Selected caliber compact card */}
      {!hideBack && (
        <div
          className="mb-6 flex items-center gap-3 px-4 py-3"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <Icon size={28} />
          <div className="flex-1">
            <span
              className="font-mono text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              {caliber.symbol}
            </span>
            <span
              className="text-xs ml-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {caliber.name}
            </span>
          </div>
          <span
            className="font-mono text-sm font-medium tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            ${caliber.price.toFixed(4)}/rd
          </span>
        </div>
      )}

      {/* Main USDC input */}
      <label
        className="block text-xs font-medium uppercase tracking-wide mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        Amount (USDT)
      </label>

      <div
        className="flex items-center px-4 py-3 transition-none"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          border: hasError
            ? "1.5px solid var(--red)"
            : isValid
              ? "1.5px solid var(--green)"
              : "1.5px solid var(--border-default)",
        }}
      >
        <input
          type="text"
          inputMode="decimal"
          value={usdcAmount}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d*\.?\d*$/.test(v)) setUsdcAmount(v);
          }}
          placeholder="0.00"
          className="flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums outline-none"
          style={{ color: "var(--text-primary)" }}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <UsdcIcon size={22} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            USDT
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <div>
          {exceedsBalance && (
            <p className="text-xs" style={{ color: "var(--red)" }}>
              Insufficient USDT balance
            </p>
          )}
          {isValid && (
            <p
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--green)" }}
            >
              <Check size={12} /> Valid amount
            </p>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {isConnected ? (
            <>
              Balance:{" "}
              {usdcBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              USDT{" "}
              <button
                type="button"
                onClick={() => setUsdcAmount(usdcBalance.toFixed(2))}
                className="ml-1 font-semibold uppercase transition-none"
                style={{ color: "var(--brass)" }}
              >
                MAX
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="font-semibold transition-none"
              style={{ color: "var(--brass)" }}
            >
              Connect wallet to see balance
            </button>
          )}
        </p>
      </div>

      {/* Quick amount buttons */}
      <div className="mt-4 flex gap-2">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setUsdcAmount(amt.toString())}
            className={`flex-1 py-2 text-sm font-medium transition-none ${
              usdcAmount === amt.toString()
                ? "bg-brass-muted border border-brass-border text-brass"
                : "bg-ax-secondary border border-border-default text-text-secondary hover:border-border-hover"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Calculation panel - simplified */}
      {usdcValue > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {"You'll receive"}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                ~{estimatedRounds.toLocaleString("en-US")} {caliber.symbol}
              </span>
              {estimatedRounds > 0 && (
                <span
                  className="font-mono text-xs tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  @ ${(usdcValue / estimatedRounds).toFixed(4)} / rd
                </span>
              )}
            </div>
          </div>

          {fee > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-text-muted hover:text-text-secondary list-none flex items-center gap-1">
                <ChevronDown
                  size={14}
                  className="group-open:rotate-180 transition-transform"
                />
                View fee details
              </summary>
              <div className="mt-2 flex flex-col gap-2 text-xs pl-5">
                <div className="flex justify-between max-w-xs">
                  <span style={{ color: "var(--text-muted)" }}>
                    Mint fee ({caliber.mintFee}%)
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    -{fee.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span style={{ color: "var(--text-muted)" }}>Net USDT</span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {netUsdc.toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* CTA */}
      {!isConnected ? (
        <button
          type="button"
          onClick={onConnect}
          className="mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none bg-brass text-ax-primary hover:bg-brass-hover"
        >
          <Wallet size={16} />
          Connect Wallet to Continue
        </button>
      ) : (
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`mt-6 flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none ${
            isValid
              ? "bg-brass text-ax-primary cursor-pointer hover:bg-brass-hover"
              : "bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
          }`}
        >
          Next
        </button>
      )}
    </div>
  );
}
