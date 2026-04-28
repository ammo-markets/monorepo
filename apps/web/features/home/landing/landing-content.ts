export type FaqItem = { question: string; answer: string };

export function getLandingChainName({ isTestnet }: { isTestnet: boolean }) {
  return isTestnet ? "Avalanche Fuji testnet" : "Avalanche C-Chain";
}

export function getLandingFaqItems(): FaqItem[] {
  return [
    {
      question: "What is Ammo Markets?",
      answer:
        "Ammo Markets is a DeFi protocol that tokenizes physical ammunition as a real world asset (RWA). Each token is backed 1:1 by physical rounds in secure storage. You can buy, trade freely on-chain — no KYC required — or redeem tokens for physical delivery.",
    },
    {
      question: "How are ammo tokens backed?",
      answer:
        "Each ammo token is backed 1:1 by physical ammunition held in secure storage. Token supply is visible on-chain, and reserves can be verified against the physical inventory backing each supported ammo market.",
    },
    {
      question: "How does the 95% buyback work?",
      answer:
        "Unlike most DeFi protocols, we buy back your ammo tokens at 95% of our current sell price — at any time, no questions asked. We then resell those rounds to other buyers, ensuring your exit is always available and always fair. You never need to find a buyer yourself.",
    },
    {
      question: "What is the $AMMO token?",
      answer:
        "$AMMO is a reward token distributed to liquidity providers. It has no governance rights or fee claims at this time — it is simply our way of rewarding early supporters who provide liquidity to the protocol.",
    },
    {
      question: "How do I earn $AMMO tokens?",
      answer:
        "Provide liquidity to the Ammo Markets AMM pool on Avalanche. $AMMO reward tokens accrue continuously, proportional to your pool share and time staked.",
    },
    {
      question: "Who can mint and trade?",
      answer:
        "Anyone with a compatible wallet and USDT on Avalanche. No KYC is required to mint or trade on-chain.",
    },
    {
      question: "Who can redeem for physical ammo?",
      answer:
        "Physical redemption is available to eligible U.S. customers with a valid shipping address, subject to applicable federal, state, and local ammunition laws.",
    },
    {
      question: "What are the fees?",
      answer:
        "There are no mint or redemption fees for users. DEX buys and sells may include token taxes.",
    },
    {
      question: "What ammunition do you sell?",
      answer:
        "We currently offer 5.56×45mm NATO only. All rounds are brass-cased, new-manufacture, sourced exclusively from reputable brands. We never purchase steel-case or remanufactured ammunition. We plan to add many more calibers and types as the protocol grows.",
    },
    {
      question: "What do I receive when I redeem?",
      answer:
        "When you redeem your tokens, you will receive brass-cased, new-manufacture 5.56 NATO rounds from reputable manufacturers, packaged in 20 or 50 round boxes. Physical redemption has a 1,000 round minimum and must be redeemed in 1,000 round increments. U.S. addresses only.",
    },
  ];
}

export const DOCS_URL = "https://docs.ammomarkets.com";
export const GITHUB_URL = "https://github.com/ammo-markets/monorepo";
export const X_URL = "https://x.com/ammomarkets";
export const APP_LAUNCH_HREF = "/exchange";
