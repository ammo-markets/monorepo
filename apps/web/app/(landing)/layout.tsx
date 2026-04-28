import type { ReactNode } from "react";
import "./landing.css";

export default function LandingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
