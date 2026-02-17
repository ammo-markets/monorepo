interface SlideControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function SlideControls({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: SlideControlsProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="rounded-lg bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        &#8592; Prev
      </button>

      <span className="font-mono text-sm text-text-muted">
        {currentSlide + 1} / {totalSlides}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        className="rounded-lg bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        Next &#8594;
      </button>
    </div>
  );
}
