import { LandingNavbar, Footer } from "@/features/layout";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
