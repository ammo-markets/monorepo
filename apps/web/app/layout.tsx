import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Ammo Markets",
    default: "Ammo Markets — Bullets on the Blockchain",
  },
  description:
    "Bullets on the blockchain. Buy, hold, and trade tokenized ammunition backed 1:1 by physical rounds in insured storage. Mint with USDC on Avalanche, trade on DEXes, redeem for delivery.",
  applicationName: "Ammo Markets",
  keywords: [
    "bullets on the blockchain",
    "tokenized ammunition",
    "ammo tokens",
    "ammunition DeFi",
    "Avalanche",
    "tokenized commodities",
    "ammunition trading",
    "5.56 NATO token",
  ],
  openGraph: {
    title: "Ammo Markets — Bullets on the Blockchain",
    description:
      "Bullets on the blockchain. Tokenized ammunition backed 1:1 by physical rounds in insured storage. Trade on Avalanche.",
    siteName: "Ammo Markets",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ammo Markets — Bullets on the Blockchain",
    description:
      "Bullets on the blockchain. Tokenized ammunition backed 1:1 by physical rounds.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
