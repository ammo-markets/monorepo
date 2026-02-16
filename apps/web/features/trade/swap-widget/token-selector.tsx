"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { TokenId, Token } from "./swap-types";
import { getToken } from "./swap-types";
import { TokenIcon } from "./token-icons";

/* ── Token Selector Dropdown ── */

export function TokenSelector({
  selected,
  onSelect,
  exclude,
  tokens,
}: {
  selected: TokenId;
  onSelect: (id: TokenId) => void;
  exclude?: TokenId;
  tokens: Token[];
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

  const token = getToken(tokens, selected);
  const filteredTokens = tokens.filter((t) => t.id !== exclude);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Select token, currently ${token.symbol}`}
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
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-100 ${
                t.id === selected
                  ? "text-brass bg-brass-muted"
                  : "text-text-primary bg-transparent hover:bg-ax-tertiary"
              }`}
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
