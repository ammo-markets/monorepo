import { Hero, HowItWorks, ProtocolStats } from "@/features/home";
import { MarketTicker, MarketCards } from "@/features/market";

export default function Page() {
  return (
    <>
      <Hero />
      <MarketTicker />
      <HowItWorks />
      <MarketCards />
      <ProtocolStats />
    </>
  );
}
