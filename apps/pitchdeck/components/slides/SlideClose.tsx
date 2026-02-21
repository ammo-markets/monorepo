"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export function SlideClose() {
  return (
    <SlideLayout className="items-center justify-center text-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        <motion.h1
          variants={fadeUp}
          className="font-display mb-6 text-3xl font-bold uppercase tracking-tight text-brass sm:text-5xl lg:text-7xl"
        >
          Make Your Ammo Liquid
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mb-4 text-base font-light text-text sm:text-xl lg:text-2xl"
        >
          The first DeFi protocol for ammunition price exposure
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="mb-6 text-sm text-text-muted sm:mb-8 sm:text-base lg:mb-10 lg:text-lg"
        >
          Global price exposure &middot; Tokenized trading &middot; Optional
          physical delivery
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="rounded-none bg-surface-elevated px-4 py-3 sm:px-6 sm:py-4 lg:px-8"
        >
          <p className="text-text-muted">
            <span className="font-semibold text-brass">
              hello@ammo.exchange
            </span>
          </p>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}
