"use client";

import React from "react";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowDownUp,
} from "lucide-react";
import { Drawer } from "vaul";
import { caliberDetails, type CaliberId } from "@/lib/mock-data";
import { caliberIcons } from "@/features/shared/caliber-icons";

/* ── Token definitions ── */

type TokenId = CaliberId | "USDC";

interface Token {
  id: TokenId;
  symbol: string;
  name: string;
  price: number;
  balance: number;
}

const tokens: Token[] = [
  { id: "USDC", symbol: "USDC", name: "USD Coin", price: 1.0, balance: 1500.0 },
  {
    id: "9MM",
    symbol: "9MM",
    name: "9mm FMJ 115gr",
    price: caliberDetails["9MM"].price,
    balance: caliberDetails["9MM"].userTokenBalance,
  },
  {
    id: "556",
    symbol: "556",
    name: "5.56 NATO 55gr",
    price: caliberDetails["556"].price,
    balance: caliberDetails["556"].userTokenBalance,
  },
  {
    id: "22LR",
    symbol: "22LR",
    name: ".22 Long Rifle 40gr",
    price: caliberDetails["22LR"].price,
    balance: caliberDetails["22LR"].userTokenBalance,
  },
  {
    id: "308",
    symbol: "308",
    name: ".308 Win 168gr",
    price: caliberDetails["308"].price,
    balance: caliberDetails["308"].userTokenBalance,
  },
];

function getToken(id: TokenId): Token {
  return tokens.find((t) => t.id === id) ?? tokens[0]!;
}

/* ── Small SVG icons ── */

function UsdcIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke="#2775CA"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="12" cy="12" r="11" fill="#2775CA" opacity="0.1" />
      <path
        d="M12 5.5V7M12 17v1.5"
        stroke="#2775CA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 15.5c0 1.1 1.12 2 2.5 2s2.5-.9 2.5-2-1.12-2-2.5-2-2.5-.9-2.5-2 1.12-2 2.5-2 2.5.9 2.5 2"
        stroke="#2775CA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UniswapLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#FF007A"
        opacity="0.15"
        stroke="#FF007A"
        strokeWidth="1"
      />
      <path
        d="M8 9.5C8 8 10 7 12 7s4 1 4 2.5c0 2-2.5 2.5-2.5 4.5h-3C10.5 12 8 11.5 8 9.5z"
        fill="#FF007A"
        opacity="0.5"
      />
      <circle cx="12" cy="16.5" r="1" fill="#FF007A" />
    </svg>
  );
}

function AaveLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#B6509E"
        opacity="0.15"
        stroke="#B6509E"
        strokeWidth="1"
      />
      <path
        d="M12 6L7 18h3l1.5-4h5L18 18h3L12 6z"
        fill="#B6509E"
        opacity="0.6"
      />
      <path d="M10.8 13L12 9.5 13.2 13h-2.4z" fill="#B6509E" opacity="0.3" />
    </svg>
  );
}

function TokenIcon({
  tokenId,
  size = 20,
}: {
  tokenId: TokenId;
  size?: number;
}) {
  if (tokenId === "USDC") return <UsdcIcon size={size} />;
  const Icon = caliberIcons[tokenId];
  return Icon ? <Icon size={size} /> : null;
}

/* ── Token Selector Dropdown ── */

function TokenSelector({
  selected,
  onSelect,
  exclude,
}: {
  selected: TokenId;
  onSelect: (id: TokenId) => void;
  exclude?: TokenId;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const token = getToken(selected);
  const filteredTokens = tokens.filter((t) => t.id !== exclude);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
        }}
      >
        <TokenIcon tokenId={selected} size={18} />
        <span className="font-mono">{token.symbol}</span>
        <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl py-1 shadow-xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-hover)",
          }}
        >
          {filteredTokens.map((t) => (
            <button
              key={t.id}
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-100"
              style={{
                color:
                  t.id === selected ? "var(--brass)" : "var(--text-primary)",
                backgroundColor:
                  t.id === selected ? "var(--brass-muted)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (t.id !== selected)
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                if (t.id !== selected)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
              onClick={() => {
                onSelect(t.id);
                setOpen(false);
              }}
            >
              <TokenIcon tokenId={t.id} size={22} />
              <div className="flex flex-col">
                <span className="font-mono font-medium">{t.symbol}</span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t.name}
                </span>
              </div>
              <span
                className="ml-auto font-mono text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.balance.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Swap Tab Content ── */

function SwapTab() {
  const [payToken, setPayToken] = useState<TokenId>("USDC");
  const [receiveToken, setReceiveToken] = useState<TokenId>("9MM");
  const [payAmount, setPayAmount] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rotated, setRotated] = useState(false);

  const payData = getToken(payToken);
  const receiveData = getToken(receiveToken);

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
                className="rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-100"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brass-border)";
                  e.currentTarget.style.color = "var(--brass)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
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
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            border: "2px solid var(--border-hover)",
            color: "var(--text-secondary)",
            transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--brass-border)";
            e.currentTarget.style.color = "var(--brass)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hover)";
            e.currentTarget.style.color = "var(--text-secondary)";
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
      <button
        type="button"
        disabled={payNum <= 0 || payNum > payData.balance}
        className="w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          backgroundColor:
            payNum > 0 && payNum <= payData.balance
              ? "var(--brass)"
              : "var(--bg-tertiary)",
          color:
            payNum > 0 && payNum <= payData.balance
              ? "var(--bg-primary)"
              : "var(--text-muted)",
        }}
        onMouseEnter={(e) => {
          if (payNum > 0 && payNum <= payData.balance) {
            e.currentTarget.style.backgroundColor = "var(--brass-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (payNum > 0 && payNum <= payData.balance) {
            e.currentTarget.style.backgroundColor = "var(--brass)";
          }
        }}
      >
        {payNum <= 0
          ? "Enter an amount"
          : payNum > payData.balance
            ? `Insufficient ${payData.symbol} balance`
            : "Swap"}
      </button>

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

/* ── Lend & Borrow Tab Content ── */

function LendBorrowTab() {
  const cards = [
    {
      title: "Supply to Aave",
      description:
        "Your ammo tokens earn yield while held as collateral. Deposit tokens and start earning interest from borrowers.",
      cta: "Supply 9MM",
      href: "https://app.aave.com/reserve-overview/?underlyingAsset=9mm",
    },
    {
      title: "Borrow USDC",
      description:
        "Borrow stablecoins against your ammo token holdings. Maintain exposure to ammo prices while accessing liquidity.",
      cta: "Borrow",
      href: "https://app.aave.com/borrow",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Use your ammo tokens as collateral
      </p>

      {cards.map((card) => (
        <a
          key={card.title}
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-3 rounded-xl p-4 transition-all duration-200"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--brass-border)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
          }}
        >
          <div className="flex items-center gap-2.5">
            <AaveLogo size={24} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {card.title}
            </span>
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {card.description}
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
            style={{ color: "var(--brass)" }}
          >
            <span>{card.cta}</span>
            <ExternalLink size={13} />
          </div>
        </a>
      ))}

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Lending and borrowing happens on Aave{"'"}s interface. Rates are set by
        the market.
      </p>
    </div>
  );
}

/* ── Widget Inner Content ── */

function SwapWidgetContent({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"swap" | "lend">("swap");

  return (
    <div
      className="flex w-full flex-col rounded-2xl"
      style={{
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--border-hover)",
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-default)" }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Trade
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-4 gap-1">
        {(["swap", "lend"] as const).map((t) => {
          const isActive = tab === t;
          const label = t === "swap" ? "Swap" : "Lend & Borrow";
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive
                  ? "var(--brass-muted)"
                  : "transparent",
                color: isActive ? "var(--brass)" : "var(--text-muted)",
                border: isActive
                  ? "1px solid var(--brass-border)"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4">
        {tab === "swap" ? <SwapTab /> : <LendBorrowTab />}
      </div>
    </div>
  );
}

/* ── Exported Modal Trigger + Widget ── */

interface SwapWidgetProps {
  defaultOpen?: boolean;
  initialPayToken?: TokenId;
  initialReceiveToken?: TokenId;
  trigger?: React.ReactNode;
}

export function SwapWidget({ defaultOpen = false, trigger }: SwapWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /* Default trigger button if none provided */
  const triggerElement = trigger || (
    <button
      type="button"
      onClick={handleOpen}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
      style={{
        backgroundColor: "transparent",
        border: "1px solid var(--border-hover)",
        color: "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brass-border)";
        e.currentTarget.style.color = "var(--brass)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
    >
      <ArrowDownUp size={16} />
      Trade
    </button>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <span onClick={handleOpen}>{triggerElement}</span>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl"
            style={{ backgroundColor: "var(--bg-primary)", maxHeight: "90vh" }}
          >
            <div
              className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full"
              style={{ backgroundColor: "var(--border-hover)" }}
            />
            <div className="overflow-y-auto px-0 pb-8">
              <SwapWidgetContent onClose={handleClose} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <>
      <span onClick={handleOpen}>{triggerElement}</span>

      {/* Desktop overlay modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={handleClose}
            aria-hidden="true"
          />
          {/* Widget */}
          <div className="relative z-10 w-full max-w-[420px] mx-4">
            <SwapWidgetContent onClose={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}
