"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-stretch overflow-hidden border-b border-border-default bg-ax-primary">
      {/* Structural Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Grid container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 border-x border-border-default">
        {/* Left Col */}
        <div className="lg:col-span-8 flex flex-col justify-center px-6 lg:px-12 py-20 border-b lg:border-b-0 lg:border-r border-border-default bg-ax-primary/90">
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tight text-text-primary uppercase mb-8">
            Make Your Ammo <br />
            <span className="text-brass">Liquid.</span>
          </h1>

          <p className="max-w-xl text-lg sm:text-xl leading-relaxed text-text-secondary font-sans mb-12">
            Buy, hold, and trade tokenized ammunition backed 1:1 by physical
            rounds in insured storage. Mint with USDC, trade freely, redeem for
            physical delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/exchange"
              className="group inline-flex items-center justify-center gap-3 bg-brass px-8 py-4 text-sm font-bold text-ax-primary uppercase tracking-widest transition-colors hover:bg-ax-primary border border-transparent hover:border-brass hover:text-brass"
            >
              Launch App
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="#market"
              className="inline-flex items-center justify-center gap-3 bg-ax-secondary px-8 py-4 text-sm font-bold text-text-primary uppercase tracking-widest border border-border-default transition-colors hover:bg-ax-tertiary hover:border-brass"
            >
              View Market
            </a>
          </div>
        </div>

        {/* Right Col: Tactical data/hud */}
        <div className="lg:col-span-4 flex flex-col bg-ax-secondary/50">
          {/* Trust strip turned into vertical HUD */}
          <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-8 gap-12 border-b border-border-default">
            <div className="space-y-2">
              <div className="text-brass font-mono text-xs font-bold tracking-widest uppercase">
                01 // Asset Backing
              </div>
              <div className="text-text-primary font-sans font-medium">
                Physical Inventory verified 1:1
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-brass font-mono text-xs font-bold tracking-widest uppercase">
                02 // Security
              </div>
              <div className="text-text-primary font-sans font-medium">
                Insured storage & audited contracts
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-brass font-mono text-xs font-bold tracking-widest uppercase">
                03 // Settlement
              </div>
              <div className="text-text-primary font-sans font-medium">
                Instant stablecoin settlement on Avalanche
              </div>
            </div>
          </div>

          <div className="p-8 font-mono text-xs text-text-muted uppercase tracking-widest flex items-center justify-between">
            <span>System Status</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green block"></span> Online
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
