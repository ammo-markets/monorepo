"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
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
          className="brass-shimmer mb-6 text-7xl font-bold tracking-tight text-brass"
        >
          Make Your Ammo Liquid
        </motion.h1>
        <motion.p variants={fadeUp} className="mb-4 text-2xl font-light text-text">
          The first DeFi protocol for ammunition price exposure
        </motion.p>
        <motion.p variants={fadeUp} className="mb-10 text-lg text-text-muted">
          Global price exposure &middot; Tokenized trading &middot; Optional physical
          delivery
        </motion.p>
        <motion.div variants={fadeUp} className="rounded-lg bg-surface-elevated px-8 py-4">
          <p className="text-text-muted">
            <span className="font-semibold text-brass">hello@ammo.exchange</span>
          </p>
        </motion.div>
      </motion.div>
    </SlideLayout>
  );
}
