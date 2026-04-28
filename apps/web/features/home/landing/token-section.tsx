import { isTestnet } from "@/lib/chain";
import { getLandingChainName } from "./landing-content";
import { RevealSection } from "./reveal-section";

const cards = [
  {
    label: "How to Earn",
    value: (
      <>
        PROVIDE
        <br />
        LIQUIDITY
      </>
    ),
    red: false,
    desc: (
      <>
        Deposit AVAX and ammo tokens like $556NATO into the DEX pool.{" "}
        <strong>$AMMO tokens</strong> are distributed continuously based on
        your share of the pool and how long you stay staked.
      </>
    ),
  },
  {
    label: "Token Utility",
    value: (
      <>
        REWARD
        <br />
        TOKEN
      </>
    ),
    red: false,
    desc: (
      <>
        $AMMO is a reward token distributed to liquidity providers. Accumulate
        it by supporting the protocol. It&apos;s our way of recognizing early
        contributors.
      </>
    ),
  },
  {
    label: "Downside Protection",
    value: (
      <>
        95%
        <br />
        BUYBACK
      </>
    ),
    red: true,
    desc: (
      <>
        We buy back your ammo tokens at{" "}
        <strong>95% of our current sell price</strong>. We resell to others —
        so your exit is always available, always fair.
      </>
    ),
  },
] as const;

function getCards(chainName: string) {
  return [
    ...cards,
    {
      label: "Infrastructure",
      value: (
        <>
          AVALANCHE
          <br />
          EXCLUSIVE
        </>
      ),
      red: false,
      desc: (
        <>
          Built exclusively on {chainName} —{" "}
          <strong>sub-second finality, near-zero fees</strong>. No bridges, no
          cross-chain complexity. Pure DeFi.
        </>
      ),
    },
  ] as const;
}

export function TokenSection() {
  const cards = getCards(getLandingChainName({ isTestnet }));

  return (
    <RevealSection className="token-section" id="tokens">
      <div className="token-bg-glow" aria-hidden />
      <h2 className="section-title">EARN $AMMO</h2>
      <div className="token-cards">
        {cards.map((c) => (
          <div key={c.label} className="token-card">
            <div className="token-card-glow" aria-hidden />
            <div className="token-card-label">{c.label}</div>
            <div className={c.red ? "token-card-value red" : "token-card-value"}>
              {c.value}
            </div>
            <p className="token-card-desc">{c.desc}</p>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
