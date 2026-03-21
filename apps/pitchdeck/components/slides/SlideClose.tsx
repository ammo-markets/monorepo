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
          Ammunition as an Asset
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
