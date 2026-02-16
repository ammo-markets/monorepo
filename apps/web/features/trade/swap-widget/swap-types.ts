import { CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";

/* Token definitions */

export type TokenId = Caliber | "USDC";

export interface Token {
  id: TokenId;
  symbol: string;
  name: string;
  price: number;
  balance: number;
}

export const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];

export function buildTokens(marketData: MarketCaliberFromAPI[]): Token[] {
  const base: Token[] = [
    { id: "USDC", symbol: "USDC", name: "USD Coin", price: 1.0, balance: 0 },
  ];
  for (const cal of CALIBERS) {
    const market = marketData.find((m) => m.caliber === cal);
    base.push({
      id: cal,
      symbol: cal,
      name: CALIBER_SPECS[cal].description,
      price: market?.pricePerRound ?? 0,
      balance: 0,
    });
  }
  return base;
}

export function getToken(tokens: Token[], id: TokenId): Token {
  return tokens.find((t) => t.id === id) ?? tokens[0]!;
}
