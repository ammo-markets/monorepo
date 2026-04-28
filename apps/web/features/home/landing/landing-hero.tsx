import { isTestnet } from "@/lib/chain";
import { APP_LAUNCH_HREF, getLandingChainName } from "./landing-content";

export function LandingHero() {
  const chainName = getLandingChainName({ isTestnet });

  return (
    <section className="hero">
      <div className="hero-glow-yellow" aria-hidden />
      <div className="hero-glow-red" aria-hidden />

      <h1>
        BULLETS
        <br />
        ON THE
        <br />
        <span className="y">BLOCK</span>
        <span className="r">CHAIN.</span>
      </h1>
      <p className="hero-desc">
        Bullets as a real world asset, tokenized 1:1 and stored in secure
        facilities. Buy, trade, and hold on-chain. Mint with USDT. Redeem for
        physical delivery.
      </p>
      <div className="hero-actions">
        <a href={APP_LAUNCH_HREF} className="btn-primary">
          Buy Bullets Now
        </a>
        <a href="#how" className="btn-ghost">
          How It Works
        </a>
      </div>

      <div className="avax-block">
        <div className="avax-label">Exclusively on</div>
        <div className="avax-name">
          AVALANCHE
          <br />
          <span>{isTestnet ? "FUJI TESTNET" : "C-CHAIN"}</span>
        </div>
        <p className="avax-desc">
          Ammo Markets is built exclusively on {chainName} — chosen for its{" "}
          <strong>sub-second finality</strong>, near-zero fees, and the most
          liquid DeFi ecosystem outside of Ethereum.
        </p>
      </div>
    </section>
  );
}
