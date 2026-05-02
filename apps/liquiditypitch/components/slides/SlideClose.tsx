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
          Build the First Onchain Commodity
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mb-4 max-w-2xl text-base font-light text-text sm:text-xl lg:text-2xl"
        >
          Liquidity is the fuse to an $8B market.
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="mb-8 max-w-2xl text-sm text-text-muted sm:text-base lg:text-lg"
        >
          Trading fees · Farming upside · 95% NAV exit floor
        </motion.p>
        <motion.a
          variants={fadeUp}
          href="https://docs.ammomarkets.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brass underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
        >
          docs.ammomarkets.com
        </motion.a>
      </motion.div>
    </SlideLayout>
  );
}
