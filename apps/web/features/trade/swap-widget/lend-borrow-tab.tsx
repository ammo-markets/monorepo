import { ExternalLink } from "lucide-react";
import { AaveLogo } from "./token-icons";

/* ── Lend & Borrow Tab Content ── */

export function LendBorrowTab() {
  const cards = [
    {
      title: "Supply to Aave",
      description:
        "Your ammo tokens earn yield while held as collateral. Deposit tokens and start earning interest from borrowers.",
      cta: "Supply 9MM",
      href: "https://app.aave.com/reserve-overview/?underlyingAsset=9mm",
    },
    {
      title: "Borrow USDC",
      description:
        "Borrow stablecoins against your ammo token holdings. Maintain exposure to ammo prices while accessing liquidity.",
      cta: "Borrow",
      href: "https://app.aave.com/borrow",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Use your ammo tokens as collateral
      </p>

      {cards.map((card) => (
        <a
          key={card.title}
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 bg-ax-secondary border border-border-default hover:border-brass-border"
        >
          <div className="flex items-center gap-2.5">
            <AaveLogo size={24} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {card.title}
            </span>
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {card.description}
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
            style={{ color: "var(--brass)" }}
          >
            <span>{card.cta}</span>
            <ExternalLink size={13} />
          </div>
        </a>
      ))}

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Lending and borrowing happens on Aave{"'"}s interface. Rates are set by
        the market.
      </p>
    </div>
  );
}
