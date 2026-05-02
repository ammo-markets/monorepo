"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import {
  ASK_INTRO,
  ASK_SLIPPAGE_ROWS,
  ASK_SUMMARY,
  ASK_TERMS,
} from "@/lib/slideData";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function SlideAsk() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        The Ask
      </h2>
      <p className="mb-6 text-sm text-text-muted sm:text-base lg:mb-8 lg:text-lg">
        {ASK_INTRO}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Slippage Targets */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col border border-surface-elevated bg-surface lg:col-span-7"
        >
          <div className="border-b border-surface-elevated bg-surface-elevated/50 px-4 py-3 sm:px-6">
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-text">
              Liquidity Targets
            </h3>
          </div>

          {/* Slippage table — column headers */}
          <div className="grid grid-cols-[1fr_1fr_1.5fr] items-end gap-4 border-b border-surface-elevated px-4 py-3 sm:px-6">
            <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Pool TVL
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[15px] font-bold uppercase tracking-widest text-brass">
                $5K Swap
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                Slippage
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Experience
            </span>
          </div>

          {/* Slippage table — data rows */}
          <div className="flex flex-col">
            {ASK_SLIPPAGE_ROWS.map((row) => (
              <motion.div
                key={row.tvl}
                variants={fadeUp}
                className={`grid grid-cols-[1fr_1fr_1.5fr] items-center gap-4 border-b border-surface-elevated px-4 py-4 sm:px-6 sm:py-5 ${
                  row.isTarget
                    ? "border-l-4 border-l-brass bg-surface-elevated/30"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <span className="font-display text-xl font-semibold text-text sm:text-2xl">
                  {row.tvl}
                </span>
                <span className="flex items-baseline gap-2 font-display text-2xl font-bold text-brass sm:text-3xl">
                  {row.slippage}
                  {row.isTarget && <span className="text-xl">★</span>}
                </span>
                <span className="text-sm text-text-secondary sm:text-base">
                  {row.note}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Summary band */}
          <motion.div
            variants={fadeUp}
            className="mt-auto bg-surface-elevated/50 px-4 py-4 sm:px-6"
          >
            <p className="text-sm font-medium text-text-secondary sm:text-base">
              {ASK_SUMMARY}
            </p>
          </motion.div>
        </motion.div>

        {/* Right Column: Execution Terms */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col border border-surface-elevated bg-surface lg:col-span-5"
        >
          <div className="border-b border-surface-elevated bg-surface-elevated/50 px-4 py-3 sm:px-6">
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight text-text">
              Execution Details
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-surface-elevated px-4 py-2 sm:px-6">
            {ASK_TERMS.map((row) => (
              <motion.div
                key={row.label}
                variants={fadeUp}
                className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4 lg:grid-cols-1 lg:gap-1 xl:grid-cols-[120px_1fr] xl:gap-4"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:pt-1 lg:pt-0 xl:pt-1">
                  {row.label}
                </span>
                <span className="text-sm font-medium text-text sm:text-base">
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
}
