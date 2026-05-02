"use client";

import { useState, useEffect, useCallback } from "react";

export function useDeck(totalSlides: number) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentSlide ? "right" : "left");
      setCurrentSlide(index);
    },
    [currentSlide, totalSlides],
  );

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);
  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(totalSlides - 1), [goTo, totalSlides]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goFirst();
          break;
        case "End":
          e.preventDefault();
          goLast();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, goFirst, goLast]);

  // Swipe gesture support for touch devices
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0]!.clientX;
      startY = e.touches[0]!.clientY;
    }

    function handleTouchEnd(e: TouchEvent) {
      const endX = e.changedTouches[0]!.clientX;
      const endY = e.changedTouches[0]!.clientY;
      const dx = endX - startX;
      const dy = endY - startY;

      // Only trigger if horizontal movement > 50px and > vertical movement
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next();
        else prev();
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [next, prev]);

  return {
    currentSlide,
    direction,
    totalSlides,
    next,
    prev,
    goTo,
    goFirst,
    goLast,
    isFirst: currentSlide === 0,
    isLast: currentSlide === totalSlides - 1,
  };
}
