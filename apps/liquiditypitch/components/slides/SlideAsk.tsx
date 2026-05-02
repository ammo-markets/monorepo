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

      {/* Unified deal-memo card: slippage table + summary + term sheet */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="border border-surface-elevated bg-surface"
      >
        {/* Slippage table — column headers */}
        <div className="grid grid-cols-3 gap-4 border-b border-surface-elevated px-4 py-3 sm:px-6 lg:px-8">
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:text-sm">
            Pool TVL
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:text-sm">
            $5K Swap Slippage
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:text-sm">
            Experience
          </span>
        </div>

        {/* Slippage table — data rows */}
        {ASK_SLIPPAGE_ROWS.map((row) => (
          <motion.div
            key={row.tvl}
            variants={fadeUp}
            className={`grid grid-cols-3 items-center gap-4 border-b border-surface-elevated px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 ${
              row.isTarget
                ? "border-l-4 border-l-brass bg-surface-elevated"
                : ""
            }`}
          >
            <span className="font-display text-xl font-semibold text-text sm:text-2xl lg:text-3xl">
              {row.tvl}
            </span>
            <span className="flex items-baseline gap-2 font-display text-2xl font-bold text-brass sm:text-3xl lg:text-4xl">
              {row.slippage}
              {row.isTarget && <span className="text-xl sm:text-2xl">★</span>}
            </span>
            <span className="text-sm text-text-secondary sm:text-base lg:text-lg">
              {row.note}
            </span>
          </motion.div>
        ))}

        {/* Summary band — connecting tissue between rationale and terms */}
        <motion.div
          variants={fadeUp}
          className="border-b border-surface-elevated bg-surface-elevated px-4 py-3 text-center sm:px-6 sm:py-4 lg:px-8"
        >
          <p className="text-sm font-semibold text-text sm:text-base lg:text-lg">
            {ASK_SUMMARY}
          </p>
        </motion.div>

        {/* Term sheet rows */}
        <div className="divide-y divide-surface-elevated">
          {ASK_TERMS.map((row) => (
            <motion.div
              key={row.label}
              variants={fadeUp}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:text-sm">
                {row.label}
              </span>
              <span className="text-sm text-text sm:text-right sm:text-base">
                {row.value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SlideLayout>
  );
}
