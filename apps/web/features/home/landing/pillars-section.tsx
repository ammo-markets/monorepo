import { RevealDiv } from "./reveal-div";
import { RevealSection } from "./reveal-section";

export function PillarsSection() {
  return (
    <RevealSection className="pillars-section" id="pillars">
      <div className="pillars-divider" />
      <div className="pillars-grid">
        <div className="pillar pillar--y">
          <div className="pillar-glow" aria-hidden />
          <div className="pillar-head">BULLETS AS A RWA</div>
          <p className="pillar-body">
            Mint ammo tokens with USDT — each backed{" "}
            <strong>1:1 by physical rounds</strong> in secure storage. Trade on
            DEXes, no KYC required to buy or trade.
          </p>
          <div className="pillar-line" />
        </div>
        <RevealDiv
          className="pillar pillar--w reveal-delay-1"
          id="pillar2"
        >
          <div className="pillar-glow" aria-hidden />
          <div className="pillar-head">PROVIDE LIQUIDITY, EARN TOKENS</div>
          <p className="pillar-body">
            Add AVAX and ammo tokens (such as $556NATO) to the DEX pool.{" "}
            <strong>$AMMO reward tokens</strong> accrue continuously,
            proportional to your pool share and time staked.
          </p>
          <div className="pillar-line" />
        </RevealDiv>
        <RevealDiv className="pillar pillar--r reveal-delay-2" id="pillar3">
          <div className="pillar-glow" aria-hidden />
          <div className="pillar-head">ALWAYS EXIT AT 95%</div>
          <p className="pillar-body">
            We buy back your bullets at{" "}
            <strong>95% of our current sell price</strong> — anytime. We resell
            them to others, so a fair exit is always guaranteed.
          </p>
          <div className="pillar-line" />
        </RevealDiv>
      </div>
    </RevealSection>
  );
}
