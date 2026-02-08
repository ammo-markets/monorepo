import { Navbar, Footer } from "@/features/layout";
import { Hero, HowItWorks, ProtocolStats } from "@/features/home";
import { MarketTicker, MarketCards } from "@/features/market";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MarketTicker />
        <HowItWorks />
        <MarketCards />
        <ProtocolStats />
      </main>
      <Footer />
    </div>
  );
}
