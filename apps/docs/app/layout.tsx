import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Ammo Markets Docs",
    default: "Ammo Markets Docs — Bullets on the Blockchain",
  },
  description:
    "Documentation for Ammo Markets — bullets on the blockchain. The tokenized ammunition trading protocol on Avalanche.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
