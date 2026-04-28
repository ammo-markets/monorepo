import { RevealSection } from "./reveal-section";

const steps = [
  {
    num: "01",
    head: "Mint",
    body: (
      <>
        Deposit <strong>USDT</strong>. We source physical 5.56×45mm NATO rounds
        from reputable manufacturers. You receive ERC-20 tokens representing
        your rounds.
      </>
    ),
  },
  {
    num: "02",
    head: "Trade",
    body: (
      <>
        Trade your tokens on decentralized exchanges.{" "}
        <strong>Speculate on ammo price movements.</strong> No identity
        verification required for on-chain trading.
      </>
    ),
  },
  {
    num: "03",
    head: "Earn",
    body: (
      <>
        Add liquidity to the AMM pool. Earn{" "}
        <strong>$AMMO reward tokens</strong> as a thank-you for supporting the
        protocol&apos;s liquidity depth.
      </>
    ),
  },
  {
    num: "04",
    head: "Redeem",
    body: (
      <>
        Burn tokens. We ship{" "}
        <strong>brass-cased, new-manufacture 5.56 NATO</strong> from reputable
        brands in 20 or 50 rd boxes. 10,000 round minimum. U.S. addresses only.
      </>
    ),
  },
] as const;

export function LandingHowSection() {
  return (
    <RevealSection className="how-section" id="how">
      <div className="how-bg-glow" aria-hidden />
      <h2 className="section-title">HOW IT WORKS</h2>
      <div className="steps">
        {steps.map((s) => (
          <div key={s.num} className="step">
            <div className="step-num">{s.num}</div>
            <div className="step-head">{s.head}</div>
            <p className="step-body">{s.body}</p>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
