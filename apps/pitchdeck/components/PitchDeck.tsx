"use client";

import { AnimatePresence } from "framer-motion";
import { useDeck } from "@/lib/useDeck";
import { SlideRenderer } from "./SlideRenderer";
import { SlideControls } from "./SlideControls";
import { SLIDES } from "./slides";

export function PitchDeck() {
  const deck = useDeck(SLIDES.length);
  const SlideComponent = SLIDES[deck.currentSlide]!;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="ambient-glow pointer-events-none absolute right-0 top-0 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[600px] lg:w-[600px]" />

      {/* Slide viewport */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={deck.direction}>
          <SlideRenderer
            key={deck.currentSlide}
            slide={deck.currentSlide}
            direction={deck.direction}
          >
            <SlideComponent />
          </SlideRenderer>
        </AnimatePresence>
      </div>

      {/* Magazine progress bar */}
      <div className="flex h-1.5 gap-px bg-background px-px">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`flex-1 transition-colors duration-200 ${
              i < deck.currentSlide
                ? "bg-brass"
                : i === deck.currentSlide
                  ? "bg-brass/60"
                  : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <SlideControls
        currentSlide={deck.currentSlide}
        totalSlides={deck.totalSlides}
        onPrev={deck.prev}
        onNext={deck.next}
        isFirst={deck.isFirst}
        isLast={deck.isLast}
      />
    </div>
  );
}
