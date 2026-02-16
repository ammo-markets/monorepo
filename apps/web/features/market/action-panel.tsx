"use client";

import { useState, useCallback } from "react";
import { ArrowDown, Wallet, ChevronUp } from "lucide-react";
import { Drawer } from "vaul";
import type { CaliberDetailData } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { FEES } from "@ammo-exchange/shared";

interface ActionPanelProps {
  data: CaliberDetailData;
  walletConnected?: boolean;
}

/* USDC Icon (simplified) */
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
        stroke="#3498DB"
        strokeWidth="1.5"
        fill="rgba(52, 152, 219, 0.1)"
      />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="#3498DB"
        fontSize="12"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

/* Shared Panel Content */
function PanelContent({ data, walletConnected = false }: ActionPanelProps) {
  const [activeTab, setActiveTab] = useState<"mint" | "redeem">("mint");
  const [mintAmount, setMintAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const IconComponent = caliberIcons[data.id as Caliber];

  const mintFeePercent = data.mintFee;
  const redeemFeePercent = data.redeemFee;

  const mintUsdcValue = Number.parseFloat(mintAmount) || 0;
  const mintFee = mintUsdcValue * (mintFeePercent / 100);
  const mintNet = mintUsdcValue - mintFee;
  const mintRounds = Math.floor(mintNet / data.price);

  const redeemTokenValue = Number.parseFloat(redeemAmount) || 0;
  const redeemFee = redeemTokenValue * (redeemFeePercent / 100);
  const redeemNet = Math.floor(redeemTokenValue - redeemFee);

  return (
    <div>
      {/* Tabs */}
      <div
        className="mb-6 flex rounded-lg p-1"
        style={{
          backgroundColor: "var(--bg-tertiary)",
        }}
        role="tablist"
      >
        {(["mint", "redeem"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-md px-4 py-2 text-sm font-semibold capitalize transition-all duration-150"
              style={{
                backgroundColor: isActive ? "var(--brass)" : "transparent",
                color: isActive ? "var(--bg-primary)" : "var(--text-secondary)",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab === "mint" ? (
        <div>
          {/* You pay */}
          <label
            className="mb-2 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            You pay
          </label>
          <div
            className="flex items-center rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent font-mono text-lg tabular-nums outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <div className="flex items-center gap-2">
              <UsdcIcon size={20} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                USDC
              </span>
            </div>
          </div>

          {/* Arrow divider */}
          <div className="my-4 flex justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <ArrowDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>

          {/* You receive */}
          <label
            className="mb-2 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            You receive
          </label>
          <div
            className="flex items-center rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span
              className="flex-1 font-mono text-lg tabular-nums"
              style={{
                color:
                  mintRounds > 0 ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {mintRounds > 0 ? `~${mintRounds.toLocaleString("en-US")}` : "0"}
            </span>
            <div className="flex items-center gap-2">
              <IconComponent size={20} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {data.symbol}
              </span>
            </div>
          </div>

          {/* Fee breakdown */}
          {mintUsdcValue > 0 && (
            <div
              className="mt-4 rounded-lg px-4 py-3"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {mintUsdcValue.toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Mint fee ({mintFeePercent}%)
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    -{mintFee.toFixed(2)} USDC
                  </span>
                </div>
                <div
                  className="my-1"
                  style={{ borderTop: "1px solid var(--border-default)" }}
                />
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Net</span>
                  <span
                    className="font-mono font-medium tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {mintNet.toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Est. rounds
                  </span>
                  <span
                    className="font-mono font-medium tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {mintRounds.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href={`/trade?tab=mint&caliber=${data.id.toLowerCase()}`}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150 no-underline ${
              walletConnected
                ? "bg-brass text-ax-primary hover:bg-brass-hover"
                : "bg-transparent text-text-primary border border-border-hover hover:bg-ax-tertiary hover:border-brass-border"
            }`}
          >
            {walletConnected ? (
              <>Mint {data.symbol}</>
            ) : (
              <>
                <Wallet size={16} />
                Connect Wallet to Mint
              </>
            )}
          </a>
        </div>
      ) : (
        /* Redeem Tab */
        <div>
          {/* You burn */}
          <label
            className="mb-2 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            You burn
          </label>
          <div
            className="flex items-center rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <input
              type="number"
              min="0"
              step="1"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent font-mono text-lg tabular-nums outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <div className="flex items-center gap-2">
              <IconComponent size={20} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {data.symbol}
              </span>
            </div>
          </div>

          {/* Arrow divider */}
          <div className="my-4 flex justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <ArrowDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>
          </div>

          {/* You receive */}
          <label
            className="mb-2 block text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            You receive
          </label>
          <div
            className="flex items-center rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span
              className="flex-1 font-mono text-lg tabular-nums"
              style={{
                color:
                  redeemNet > 0 ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {redeemNet > 0
                ? `~${redeemNet.toLocaleString("en-US")} rounds shipped`
                : "0 rounds"}
            </span>
          </div>

          {/* Fee breakdown */}
          {redeemTokenValue > 0 && (
            <div
              className="mt-4 rounded-lg px-4 py-3"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Tokens burned
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {redeemTokenValue.toLocaleString("en-US")} {data.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Redeem fee ({redeemFeePercent}%)
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    -{Math.ceil(redeemFee)} rounds
                  </span>
                </div>
                <div
                  className="my-1"
                  style={{ borderTop: "1px solid var(--border-default)" }}
                />
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>
                    Est. rounds shipped
                  </span>
                  <span
                    className="font-mono font-medium tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {redeemNet.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href={`/trade?tab=redeem&caliber=${data.id.toLowerCase()}`}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-150 no-underline ${
              walletConnected
                ? "bg-brass text-ax-primary hover:bg-brass-hover"
                : "bg-transparent text-text-primary border border-border-hover hover:bg-ax-tertiary hover:border-brass-border"
            }`}
          >
            {walletConnected ? (
              <>{"Continue to Redeem \u2192"}</>
            ) : (
              <>
                <Wallet size={16} />
                Connect Wallet to Redeem
              </>
            )}
          </a>
        </div>
      )}
    </div>
  );
}

/* Desktop Sticky Panel */
export function ActionPanelDesktop(props: ActionPanelProps) {
  return (
    <div
      className="hidden lg:block sticky top-24 rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <PanelContent {...props} />
    </div>
  );
}

/* Mobile Bottom Sheet */
export function ActionPanelMobile(props: ActionPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Drawer.Root open={open} onOpenChange={setOpen}>
        {/* Collapsed trigger bar */}
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-xl"
            style={{
              backgroundColor: "rgba(18, 18, 26, 0.95)",
              borderTop: "1px solid var(--border-default)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                ${props.data.price.toFixed(2)}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {props.data.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: "var(--brass)",
                  color: "var(--bg-primary)",
                }}
              >
                Mint
              </span>
              <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
            </div>
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl"
            style={{
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: "var(--border-hover)" }}
              />
            </div>
            <Drawer.Title className="sr-only">
              Trade {props.data.symbol}
            </Drawer.Title>
            <div className="overflow-y-auto px-5 pb-8">
              <PanelContent {...props} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
