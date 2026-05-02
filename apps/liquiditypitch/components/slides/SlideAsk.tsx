"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { ASK_HEADLINE, ASK_SUB, ASK_TERMS } from "@/lib/slideData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function SlideAsk() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        The Ask
      </h2>
      <p className="mb-6 text-sm text-text-muted sm:text-base lg:mb-10 lg:text-lg">
        A simple, sized commitment per caliber. Mintable, redeemable, and
        downside-protected.
      </p>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center lg:w-2/5"
        >
          <div className="font-display text-4xl font-bold uppercase tracking-tight text-brass sm:text-5xl lg:text-6xl">
            {ASK_HEADLINE}
          </div>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl">
            {ASK_SUB}
          </p>
        </motion.div>

        <StaggerContainer
          preset="magazine-load"
          className="flex flex-col divide-y divide-surface-elevated border border-surface-elevated bg-surface lg:w-3/5"
        >
          {ASK_TERMS.map((row) => (
            <StaggerItem key={row.label}>
              <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5 lg:p-6">
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted sm:text-sm">
                  {row.label}
                </span>
                <span className="text-base font-semibold text-text sm:text-right sm:text-lg">
                  {row.value}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </SlideLayout>
  );
}
