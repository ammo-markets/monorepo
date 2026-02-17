interface SlideRendererProps {
  slide: number;
  direction: "left" | "right";
  children: React.ReactNode;
}

export function SlideRenderer({ slide, direction, children }: SlideRendererProps) {
  return (
    <div
      key={slide}
      className="absolute inset-0"
      style={{
        animation: `${
          direction === "right" ? "slideInRight" : "slideInLeft"
        } 300ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
