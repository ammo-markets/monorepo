interface SlideLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideLayout({ children, className }: SlideLayoutProps) {
  return (
    <div className={`flex h-full w-full flex-col p-12 ${className ?? ""}`}>
      {children}
    </div>
  );
}
