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
    <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="btn-recoil-prev min-h-[44px] min-w-[44px] rounded-none bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        &#8592; Prev
      </button>

      <span className="font-mono text-xs text-text-muted sm:text-sm">
        {currentSlide + 1} / {totalSlides}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        className="btn-recoil-next min-h-[44px] min-w-[44px] rounded-none bg-surface px-4 py-2 text-text disabled:opacity-30"
      >
        Next &#8594;
      </button>
    </div>
  );
}
