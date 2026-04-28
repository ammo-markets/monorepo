import {
  GuaranteeSection,
  LandingFaqSection,
  LandingFooter,
  LandingHero,
  LandingHowSection,
  LandingShell,
  PillarsSection,
  TokenSection,
} from "@/features/home/landing";

export default function Page() {
  return (
    <LandingShell>
      <LandingHero />
      <PillarsSection />
      <GuaranteeSection />
      <LandingHowSection />
      <TokenSection />
      <LandingFaqSection />
      <LandingFooter />
    </LandingShell>
  );
}
