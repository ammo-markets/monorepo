"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StaggerPreset = "magazine-load" | "firing-sequence";

interface StaggerContainerProps {
  children: ReactNode;
  preset?: StaggerPreset;
  className?: string;
  delay?: number;
  staggerMs?: number;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  preset?: StaggerPreset;
}

const containerVariants = (staggerMs: number, delay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerMs / 1000,
      delayChildren: delay / 1000,
    },
  },
});

const itemVariants: Record<
  StaggerPreset,
  { hidden: Record<string, number>; show: Record<string, number> }
> = {
  "magazine-load": {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
  "firing-sequence": {
    hidden: { opacity: 0, x: -15 },
    show: { opacity: 1, x: 0 },
  },
};

export function StaggerContainer({
  children,
  preset = "magazine-load",
  className,
  delay = 0,
  staggerMs,
}: StaggerContainerProps) {
  const ms = staggerMs ?? (preset === "magazine-load" ? 80 : 50);

  return (
    <motion.div
      variants={containerVariants(ms, delay)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  preset = "magazine-load",
}: StaggerItemProps) {
  return (
    <motion.div
      variants={itemVariants[preset]}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
