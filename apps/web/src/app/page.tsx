import { Navbar } from "@/components/ammo/navbar";
import { Hero } from "@/components/ammo/hero";
import { MarketTicker } from "@/components/ammo/market-ticker";
import { HowItWorks } from "@/components/ammo/how-it-works";
import { MarketCards } from "@/components/ammo/market-cards";
import { ProtocolStats } from "@/components/ammo/protocol-stats";
import { Footer } from "@/components/ammo/footer";

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
