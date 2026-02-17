"use client";

import { useDeck } from "@/lib/useDeck";
import { SlideRenderer } from "./SlideRenderer";
import { SlideControls } from "./SlideControls";
import { SLIDES } from "./slides";

export function PitchDeck() {
  const deck = useDeck(SLIDES.length);
  const SlideComponent = SLIDES[deck.currentSlide]!;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Slide viewport */}
      <div className="relative flex-1 overflow-hidden">
        <SlideRenderer slide={deck.currentSlide} direction={deck.direction}>
          <SlideComponent />
        </SlideRenderer>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-brass"
          style={{
            width: `${((deck.currentSlide + 1) / deck.totalSlides) * 100}%`,
            transition: "width 300ms ease-out",
          }}
        />
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
