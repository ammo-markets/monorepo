"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ChevronDown, ChevronUp, ArrowDownUp } from "lucide-react";
import type { TokenId, Token } from "./swap-types";
import { getToken } from "./swap-types";
import { TokenSelector } from "./token-selector";
import { UniswapLogo } from "./token-icons";

/* ── Swap Tab Content ── */

export function SwapTab({ tokens }: { tokens: Token[] }) {
  const { isConnected } = useAuth();
  const { openConnectModal } = useConnectModal();
  const [payToken, setPayToken] = useState<TokenId>("USDC");
  const [receiveToken, setReceiveToken] = useState<TokenId>("9MM_PRACTICE");
  const [payAmount, setPayAmount] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rotated, setRotated] = useState(false);

  const payData = getToken(tokens, payToken);
  const receiveData = getToken(tokens, receiveToken);

  const rate = payData.price / receiveData.price;
  const payNum = Number.parseFloat(payAmount) || 0;
  const receiveAmount = payNum * rate;
  const minReceived = receiveAmount * 0.995;

  const handleSwapDirection = () => {
    setRotated(!rotated);
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* You pay */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            You pay
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Balance: {payData.balance.toLocaleString()} {payData.symbol}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <TokenSelector
            selected={payToken}
            onSelect={setPayToken}
            exclude={receiveToken}
            tokens={tokens}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={payAmount}
            onChange={(e) => {
              const v = e.target.value;
              if (/^[0-9]*\.?[0-9]*$/.test(v)) setPayAmount(v);
            }}
            aria-label="Amount to pay"
            className="w-full bg-transparent text-right font-mono text-2xl font-semibold outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        {/* Quick amount pills */}
        <div className="mt-3 flex gap-2">
          {["25%", "50%", "75%", "MAX"].map((pct) => {
            const fraction = pct === "MAX" ? 1 : Number.parseInt(pct) / 100;
            return (
              <button
                key={pct}
                type="button"
                className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-100 bg-ax-tertiary text-text-secondary border border-border-default hover:border-brass-border hover:text-brass"
                onClick={() =>
                  setPayAmount((payData.balance * fraction).toFixed(2))
                }
              >
                {pct}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swap direction button */}
      <div className="flex justify-center -my-1.5 relative z-10">
        <button
          type="button"
          onClick={handleSwapDirection}
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 bg-ax-tertiary border-2 border-border-hover text-text-secondary hover:border-brass-border hover:text-brass"
          style={{
            transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-label="Swap direction"
        >
          <ArrowDownUp size={18} />
        </button>
      </div>

      {/* You receive */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            You receive
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Balance: {receiveData.balance.toLocaleString()} {receiveData.symbol}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <TokenSelector
            selected={receiveToken}
            onSelect={setReceiveToken}
            exclude={payToken}
            tokens={tokens}
          />
          <div
            className="w-full text-right font-mono text-2xl font-semibold"
            style={{
              color: payNum > 0 ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            {payNum > 0
              ? `~${receiveAmount.toLocaleString(undefined, { maximumFractionDigits: receiveData.price < 0.1 ? 0 : 2 })}`
              : "0.00"}
          </div>
        </div>
        {payNum > 0 && (
          <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            1 {receiveData.symbol} ={" "}
            {receiveData.price.toFixed(receiveData.price < 0.1 ? 3 : 2)} USDC
          </div>
        )}
      </div>

      {/* Exchange details expandable */}
      {payNum > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-xs transition-colors duration-100"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setDetailsOpen(!detailsOpen)}
            aria-expanded={detailsOpen}
            aria-label="Toggle exchange details"
          >
            <span>
              1 {payData.symbol} = {rate.toFixed(rate > 1 ? 2 : 4)}{" "}
              {receiveData.symbol}
            </span>
            <div className="flex items-center gap-1">
              <span style={{ color: "var(--text-muted)" }}>Details</span>
              {detailsOpen ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </div>
          </button>

          {detailsOpen && (
            <div
              className="flex flex-col gap-2.5 px-4 pb-4"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <div className="pt-3 flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Route</span>
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {payData.symbol} → {receiveData.symbol} via Uniswap V3
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Price impact</span>
                <span style={{ color: "var(--green)" }}>{"< 0.1%"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>
                  Minimum received
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {minReceived.toLocaleString(undefined, {
                    maximumFractionDigits: receiveData.price < 0.1 ? 0 : 2,
                  })}{" "}
                  {receiveData.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Network fee</span>
                <span style={{ color: "var(--text-secondary)" }}>~$0.02</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Provider</span>
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <UniswapLogo size={14} />
                  Uniswap V3
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Swap CTA */}
      {!isConnected ? (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors duration-150 bg-brass text-ax-primary hover:bg-brass-hover"
          onClick={openConnectModal}
        >
          Connect Wallet to Swap
        </button>
      ) : (
        <button
          type="button"
          disabled={payNum <= 0 || payNum > payData.balance}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            payNum > 0 && payNum <= payData.balance
              ? "bg-brass text-ax-primary hover:bg-brass-hover"
              : "bg-ax-tertiary text-text-muted"
          }`}
        >
          {payNum <= 0
            ? "Enter an amount"
            : payNum > payData.balance
              ? `Insufficient ${payData.symbol} balance`
              : "Swap"}
        </button>
      )}

      {/* Powered by Uniswap */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <UniswapLogo size={14} />
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Powered by Uniswap
        </span>
      </div>
    </div>
  );
}
