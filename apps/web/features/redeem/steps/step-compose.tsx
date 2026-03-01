import { Check, Wallet } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import { PrimaryButton } from "@/features/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { FEES } from "@ammo-exchange/shared";
import { formatUnits } from "viem";
import { OrderSettingsMenu } from "@/features/shared/order-settings-menu";
import { useMemo } from "react";

export function StepCompose({
  selectedCaliber,
  roundsAmount,
  tokenBalances,
  caliberDetailsMap,
  deadlineHours,
  onDeadlineChange,
  onSelectCaliber,
  setRoundsAmount,
  onNext,
  isEmbedded,
  isConnected,
  onConnect,
}: {
  selectedCaliber: Caliber | null;
  roundsAmount: string;
  tokenBalances: Record<Caliber, bigint | undefined>;
  caliberDetailsMap: Record<Caliber, CaliberDetailData> | null;
  deadlineHours: number;
  onDeadlineChange: (hours: number) => void;
  onSelectCaliber: (id: Caliber) => void;
  setRoundsAmount: (v: string) => void;
  onNext: () => void;
  isEmbedded?: boolean;
  isConnected: boolean;
  onConnect: () => void;
}) {
  const caliber =
    selectedCaliber && caliberDetailsMap
      ? caliberDetailsMap[selectedCaliber]
      : null;
  const rounds = Number.parseInt(roundsAmount) || 0;
  const fee = Math.ceil(rounds * (FEES.REDEEM_FEE_BPS / FEES.BPS_DENOMINATOR));
  const netRounds = rounds - fee;
  const estValue = netRounds * (caliber?.price ?? 0);
  const minRedeem = caliber ? caliber.minMint : 50;

  // Real on-chain balance for selected caliber (18 decimals -> number)
  const balance = useMemo(() => {
    if (!selectedCaliber) return 0;
    const raw = tokenBalances[selectedCaliber];
    if (raw === undefined) return 0;
    return Number(formatUnits(raw, 18));
  }, [selectedCaliber, tokenBalances]);

  const belowMin = rounds > 0 && rounds < minRedeem;
  const exceedsBalance = rounds > balance;
  const isValid = rounds >= minRedeem && !exceedsBalance;
  const hasError = belowMin || exceedsBalance;

  const allCalibers = caliberDetailsMap ? Object.values(caliberDetailsMap) : [];

  return (
    <div>
      {!isEmbedded && (
        <>
          <h2
            className="mb-1 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Select Caliber & Amount
          </h2>
          <p
            className="mb-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Choose the token to redeem for physical ammunition delivery.
          </p>

          {/* Caliber card selector */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {allCalibers.map((cal) => {
              const isSelected = selectedCaliber === cal.id;
              const Icon = caliberIcons[cal.id];
              const calBalance = tokenBalances[cal.id];
              const displayBalance = !isConnected
                ? "—"
                : calBalance !== undefined
                  ? Math.floor(
                      Number(formatUnits(calBalance, 18)),
                    ).toLocaleString("en-US")
                  : "...";
              return (
                <button
                  key={cal.id}
                  type="button"
                  onClick={() => onSelectCaliber(cal.id)}
                  className={`group relative flex flex-col gap-3 p-4 text-left transition-none ${
                    isSelected
                      ? "bg-brass-muted border-2 border-brass"
                      : "bg-ax-secondary border-2 border-border-default hover:border-border-hover"
                  }`}
                >
                  {isSelected && (
                    <span
                      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: "var(--brass)" }}
                    >
                      <Check
                        size={12}
                        strokeWidth={3}
                        style={{ color: "var(--bg-primary)" }}
                      />
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <Icon size={40} />
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {cal.symbol}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {cal.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Balance:{" "}
                      <span
                        className="font-mono font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {displayBalance}
                      </span>
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Min: {cal.minMint} rds
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {isEmbedded && (
        <>
          <h2
            className="mb-1 font-display text-2xl font-bold uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Enter Amount
          </h2>
          <p
            className="mb-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter the number of rounds to redeem.
          </p>
        </>
      )}

      {/* Amount input -- only shows when caliber selected */}
      {caliber && (
        <>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="block text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                Rounds to Redeem
              </label>
              <OrderSettingsMenu
                expiryHours={deadlineHours}
                onExpiryChange={onDeadlineChange}
              />
            </div>

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
                inputMode="numeric"
                value={roundsAmount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) setRoundsAmount(v);
                }}
                placeholder="0"
                className="flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = caliberIcons[caliber.id];
                  return <Icon size={22} />;
                })()}
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {caliber.symbol}
                </span>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <div>
                {belowMin && (
                  <p className="text-xs" style={{ color: "var(--red)" }}>
                    Minimum redeem is {minRedeem} rounds
                  </p>
                )}
                {exceedsBalance && (
                  <p className="text-xs" style={{ color: "var(--red)" }}>
                    Insufficient token balance
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
                Balance: {Math.floor(balance).toLocaleString("en-US")}{" "}
                {caliber.symbol}{" "}
                <button
                  type="button"
                  onClick={() =>
                    setRoundsAmount(Math.floor(balance).toString())
                  }
                  className="ml-1 font-semibold uppercase transition-none"
                  style={{ color: "var(--brass)" }}
                >
                  MAX
                </button>
              </p>
            </div>
          </div>

          {/* Calculation panel - Net prominent, est dollar smaller */}
          {rounds > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <div
                className="flex flex-col gap-1 rounded-lg px-4 py-3"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex justify-between items-center">
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Net rounds shipped
                  </span>
                  <span
                    className="font-mono font-bold tabular-nums text-lg"
                    style={{ color: "var(--brass)" }}
                  >
                    {netRounds.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-end">
                  <span
                    className="font-mono text-xs tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Est. value: ${estValue.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Burn amount: {rounds.toLocaleString("en-US")}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Fee (1.5%): -{fee}
                </span>
              </div>
            </div>
          )}
        </>
      )}

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
        <PrimaryButton disabled={!isValid} onClick={onNext}>
          Review Order
        </PrimaryButton>
      )}
    </div>
  );
}
