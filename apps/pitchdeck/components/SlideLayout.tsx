interface SlideLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideLayout({ children, className }: SlideLayoutProps) {
  return (
    <div
      className={`flex min-h-full w-full flex-col p-4 sm:p-8 lg:h-full lg:min-h-0 lg:p-12 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
