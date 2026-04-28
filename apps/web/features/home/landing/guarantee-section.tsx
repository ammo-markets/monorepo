import Link from "next/link";
import { APP_LAUNCH_HREF } from "./landing-content";
import { RevealSection } from "./reveal-section";

export function GuaranteeSection() {
  return (
    <RevealSection className="guarantee-section" id="guarantee">
      <div className="guarantee-bg-glow" aria-hidden />
      <div className="guarantee-inner">
        <div className="guarantee-left">
          <div className="guarantee-pct">95%</div>
          <div className="guarantee-sub">Buyback Floor</div>
        </div>
        <div className="guarantee-right">
          <div className="guarantee-label">Protocol Guarantee</div>
          <h2 className="guarantee-title">
            YOUR EXIT IS
            <br />
            ALWAYS OPEN
          </h2>
          <p className="guarantee-desc">
            Unlike most DeFi protocols, Ammo Markets buys back your real world
            assets at <strong>95% of our current sell price</strong> — anytime,
            no conditions. We then resell them to others. Your liquidity never
            depends on finding a buyer yourself.
          </p>
          <Link href={APP_LAUNCH_HREF} className="btn-primary">
            Sell or Mint →
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
