"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function SlideCover() {
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
          className="font-display text-4xl font-bold uppercase tracking-tighter text-brass sm:text-6xl lg:text-8xl"
          initial={{ letterSpacing: "0.2em", opacity: 0, y: 20 }}
          animate={{ letterSpacing: "-0.02em", opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Ammo Exchange
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mb-4 font-display text-xl uppercase tracking-widest text-text sm:text-3xl lg:text-4xl"
        >
          Make Your Ammo Liquid
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm uppercase tracking-widest text-text-secondary sm:text-lg lg:text-xl"
        >
          Tokenized ammunition trading
        </motion.p>
      </motion.div>
    </SlideLayout>
  );
}
