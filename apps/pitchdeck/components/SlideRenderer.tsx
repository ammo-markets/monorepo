"use client";

import { motion } from "framer-motion";

interface SlideRendererProps {
  slide: number;
  direction: "left" | "right";
  children: React.ReactNode;
}

const variants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "right" ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "right" ? -60 : 60,
    opacity: 0,
  }),
};

export function SlideRenderer({
  slide,
  direction,
  children,
}: SlideRendererProps) {
  return (
    <motion.div
      key={slide}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "tween", duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { duration: 0.25 },
      }}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden lg:overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
