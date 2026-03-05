"use client";

import Link from "next/link";
import type { CaliberDetailData } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface ActionPanelProps {
  data: CaliberDetailData;
  walletConnected?: boolean;
}

export function ActionPanelDesktop({ data }: ActionPanelProps) {
  return (
    <div className="hidden lg:flex flex-col gap-4 sticky top-24">
      {/* Mint Card */}
      <div className="rounded-xl border border-border-default bg-ax-secondary p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">
          Mint
        </h3>
        <p className="mb-6 text-sm text-text-muted">
          Mint tokenized {data.name} using USDT. Tokens represent a 1:1 claim on
          physical ammunition.
        </p>
        <Link
          href={`/exchange?tab=mint&caliber=${data.id.toLowerCase()}`}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-brass py-3 text-sm font-bold text-ax-primary transition-colors hover:bg-brass-hover"
        >
          Mint {data.symbol}
          <ArrowRight
            size={14}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Redeem Card */}
      <div className="rounded-xl border border-border-default bg-ax-secondary p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">
          Redeem
        </h3>
        <p className="mb-6 text-sm text-text-muted">
          Burn your {data.symbol} tokens to take physical delivery of
          factory-new ammunition.
        </p>
        <Link
          href={`/exchange?tab=redeem&caliber=${data.id.toLowerCase()}`}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-border-hover bg-transparent py-3 text-sm font-bold text-text-primary transition-colors hover:border-brass-border hover:bg-ax-tertiary"
        >
          Redeem {data.symbol}
          <ArrowRight
            size={14}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}

export function ActionPanelMobile({ data }: ActionPanelProps) {
  return (
    <div className="lg:hidden">
      {/* Inline content for mobile flow */}
      <div className="mt-8 mb-36 flex flex-col gap-4">
        <div className="rounded-xl border border-border-default bg-ax-secondary p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">
            Mint
          </h3>
          <p className="mb-6 text-sm text-text-muted">
            Mint tokenized {data.name} using USDT.
          </p>
          <Link
            href={`/exchange?tab=mint&caliber=${data.id.toLowerCase()}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brass py-3 text-sm font-bold text-ax-primary transition-colors active:bg-brass-hover"
          >
            Mint {data.symbol}
          </Link>
        </div>

        <div className="rounded-xl border border-border-default bg-ax-secondary p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">
            Redeem
          </h3>
          <p className="mb-6 text-sm text-text-muted">
            Burn your {data.symbol} for physical delivery.
          </p>
          <Link
            href={`/exchange?tab=redeem&caliber=${data.id.toLowerCase()}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-hover bg-transparent py-3 text-sm font-bold text-text-primary transition-colors active:bg-ax-tertiary"
          >
            Redeem {data.symbol}
          </Link>
        </div>
      </div>

      {/* Sticky Bottom Bar for quick actions */}
      <div
        className="fixed bottom-16 left-0 right-0 z-40 flex items-center gap-3 border-t border-border-default bg-ax-secondary/95 px-4 py-3 backdrop-blur-xl"
      >
        <Link
          href={`/exchange?tab=redeem&caliber=${data.id.toLowerCase()}`}
          className="flex-1 flex items-center justify-center rounded-lg border border-border-hover bg-transparent py-3.5 text-sm font-bold text-text-primary transition-colors active:bg-ax-tertiary"
        >
          Redeem
        </Link>
        <Link
          href={`/exchange?tab=mint&caliber=${data.id.toLowerCase()}`}
          className="flex-[1.5] flex items-center justify-center rounded-lg bg-brass py-3.5 text-sm font-bold text-ax-primary transition-colors active:bg-brass-hover"
        >
          Mint {data.symbol}
        </Link>
      </div>
    </div>
  );
}
